# Design: Multi-Site Management

## Decision Authority

This design implements Phase 24 founder decisions D1–D18 and D57–D84. D19–D55
remain preserved cross-phase evidence and are not launch gates; the deferred
D56 question is out of scope. The Phase 24 PRD and accepted ADRs provide the
detailed decision rationale. The committed Phase 24 traceability matrix maps
every decision and PRD story through this change, task, proof, and release
evidence. This design does not revive rejected alternatives or treat current
implementation as normative merely because it exists.

## Current Reality And Intended Replacement

Current `develop` has a strict local Payload/Postgres E2E runner, a transport-
agnostic published-content reader, injected payment/provider test seams, and CI
disposable Postgres. It does not have the accepted Phase 24 operational models.
Public CMS context reserves a null Site, public reads select mutable latest
published content, donation paths and formatters retain USD/two-decimal
assumptions, and Vercel product-domain state is absent. Phase 23's proposed
immutable generation/working-revision substrate is not merged.

The intended system replaces those interim assumptions with explicit Site,
host, locale, generation, Money, owner, and revision authority. Compatibility
code may read old data only during bounded rollout; it cannot remain a second
writer or source of favorable truth.

## Goals

- Make normal multi-Site, domain, locale, brand, and currency work self-service
  for authorized Tenant staff.
- Keep donor choices and old public meanings explicit, stable, and honest.
- Make invalid cross-scope/cardinality/money states structurally impossible.
- Preserve safe operation through retries, concurrency, provider rate limits,
  provider ambiguity, partial rollout, and weak networks.
- Reuse current public, command, database, and E2E seams without introducing a
  generic resolver, workflow, settings engine, or provider framework.

## Non-Goals

The proposal's Out Of Scope list is controlling. In particular, this design is
not a domain registrar, FX/accounting system, translation workflow, CMS rewrite,
Page taxonomy, redirect console, provider abstraction marketplace, or second
authorization/task/audit platform.

## Bounded Contexts And Authorities

### Site Platform

Site Platform owns stable Site identity, descriptive purpose, Default Site,
private setup, website lifecycle, Site-public Giving admission policy, Site
Locale identity/default policy, Default Site Locale Plan, Site Brand Versions,
Site currency policy, suggested amounts, and composition of exact owner proof.
It does not own content, Navigation, message readiness, merchant identity,
accepted money, or provider facts.

### Operational Domain Authority

Operational Postgres owns canonical hostname identity, platform-wide current
claim, proof challenge consumption, Site binding intervals, Primary/Redirect/
not-website role versions, movement/disconnection barriers, operation plans and
receipts, and bounded provider-evidence references. DNS and Vercel prove or
execute; they never assign product ownership.

### Public Content And Route Owners

Payload owns content authoring behind Web Studio. Accepted Page/resource owners
own Working Revisions, publication heads, placements, transfer classification,
translation input, Copy Qualification, and continuity decisions. One immutable
Public Site Generation is the favorable serving unit. Phase 5 remains the sole
runtime host/router and consumes compiled effects; it never invents purpose or
performs provider/database authoring.

### Giving, Payments, And Finance

Giving owns issued public-entry meaning, public-Giving admission, editable gift
intent, and final accepted Site/source attribution. Payments owns exact setup
qualification and provider execution. Phase 13, Phase 16, receipt, ledger,
settlement, and accounting owners retain their existing immutable facts. Site,
locale, domain, browser location, and currency policy never choose Legal Entity,
Settlement Account Binding, connected account, bank, receipt issuer, or
accounting lane.

### Tenant Donor Account And Messages

One current complete Tenant Donor Account Brand governs the Tenant-wide
authenticated donor experience. A Tenant/environment portal remains unavailable
until one exact verified Tenant Donor Portal Host is active there. Host
activation proves DNS/TLS/platform binding, exact callbacks/recovery/sign-out,
host-only secure sessions, complete Tenant brand, legal/support destinations,
and production-shaped recovery; replacement is successor-first and host loss
never falls back. Site may contribute safe secondary orientation only. Phase 17
alone owns message readiness and exposes one compact permission-filtered read
projection to the Site workspace.

## Canonical Records And Invariants

The physical schema may group closely related records, but it must preserve the
following logical facts rather than collapsing them into generic settings or
status columns:

- stable Site, immutable lifecycle facts, one current Default Site head;
- stable Site Locale, immutable default-locale versions, at most one Active
  undated Default Site Locale Plan lineage;
- complete immutable Site Brand Version and one exact generation pin;
- immutable Site currency-policy versions and per-currency/cadence Suggested
  Amount Set versions;
- canonical hostname, single current global claim, proof challenge, binding
  interval, role version, barrier, operation plan/receipt, provider attempt;
- immutable public route allocation/reservation and complete generation head;
- Issued Giving Address allocation, at-most-one preferred-for-sharing head,
  terminal Stop disposition, and managed-placement preparation receipts;
- translation provenance/Basis, immutable Copy Source Checkpoint, Copy
  Qualification evidence, and disposable Copy Source Disposition projection;
- directional exact ordinary Page successor relation, sparse Page Purpose
  Continuity Version, and one material-purpose handoff receipt containing
  resource-scoped source checkpoints plus D2 path/descendant/order dispositions.

Every relation carries exact Tenant and necessary Site/locale/owner scope.
Composite keys and foreign keys enforce same-scope membership. One-current and
global-host uniqueness use database constraints, not application checks.
Retained public identities, claims, revisions, receipts, and terminal history
use restrictive deletion. Current heads advance by compare-and-set and never
mutate prior versions.

Money is represented only as checked integer minor units plus validated ISO
currency and versioned exponent metadata. Currency policy, qualification,
suggestion, editable intent, accepted contribution, provider balance,
settlement, and accounting are different owners. No stored or computed
`amount * 100`/`amount / 100` convention is authoritative.

## Command Model

All authoritative actions enter through narrow server command handlers. The
handler derives actor, Tenant, environment, Site, owner, exact effect capability,
and audit attribution from trusted context; clients cannot choose them. Each
command carries expected current revisions plus one semantic idempotency key.
The database transaction:

1. reauthorizes the current actor/effect and reloads every authoritative head;
2. obtains a documented deterministic lock order;
3. validates the full command and all structural/source invariants;
4. appends immutable facts and advances heads atomically;
5. records one durable business receipt and security-audit reference and, only
   when asynchronous secondary work is required, one deduplicated outbox item;
6. returns the existing receipt for exact replay or conflicts on changed input.

Provider calls and long scans never occur under authoritative locks. Workers
claim outbox effects with fencing and bounded retry. An ambiguous provider
outcome is reconciled from the exact operation plus authenticated provider
state before another attempt. Adverse serving/admission fences acknowledge
before destructive external work or favorable-head removal.

## Site And Locale Lifecycle

`Add Site` creates identity and private setup only. First activation uses one
production-faithful preview and a single Go live command proving one exact
canonical host, default locale, complete immutable generation, compatible
brand/shell/Navigation, and no current blocker. Optional Giving, messages,
Redirect Site Domains, and other locales remain independent.

Website serving and Site-public Giving admission use separate policy lineages
and action buttons. A monotonic admission revision classifies pre-admitted
checkout. Retirement requires current proof of website-offline, Giving-paused/
never-enabled, and a different Default Site; it atomically makes favorable
Site operations terminal while retaining source-owned history.

Locale-bearing public routes use the trusted origin, optional permanent shared-
host Site handle, reserved `/lang/`, immutable lowercase exact canonical locale
segment, and owner path. Explicit routes do not negotiate. The locale-neutral
Site Root Entry accepts safe navigation only and issues one `307` to the current
ready default-locale homepage. Other methods follow the fixed nonredirect
contract and query/fragment carry is owner-allowlisted or dropped.

Core maintains one small, code-owned, versioned Site Locale Publication
Contract. Its first version covers routing identity; homepage/frame/Brand/
Navigation and invoked legal/support destinations; known-Site adverse pages;
exact-locale direction/script/font/bidi/responsive/accessibility completeness;
and canonical, alternate, sitemap, robots, serializer, generation, and cache
closure. Source adapters return versioned exact evidence; they do not write a
checklist table. This contract is distinct from the Domain Critical Owner-
Family Registry and shares neither membership nor authority with it.

## Domain Lifecycle And Provider Effects

Every public nonretired Site has one Primary Site Domain. Redirect Site Domains
never serve a duplicate origin; Phase 5 first dispatches stronger source-owned
routes, then may redirect only qualified ordinary `GET`/`HEAD` navigation one
hop to the exact Primary destination with no unsafe context.

A primary replacement requires one initially unselected former-domain website
choice. The command compiles the exact compatible public-origin successors and
advances Domain and generation heads atomically. Provider whole-domain redirect
rules are not used.

Disconnection requires the complete finite current owner manifest to prove no
positive Core hosting dependency. One transaction establishes Disconnecting;
after all public cohorts acknowledge adverse state, a sealed worker removes
only the exact Core-controlled Vercel association. Authenticated absence permits
the final claim/binding close. Unknown results retain the fence and occupancy.

Fresh connection starts with a seven-day 256-bit exact-host TXT challenge.
Unproved attempts remain private, nonexclusive, provider-dark, and claim
nothing. Trusted proof consumption atomically acquires the global host claim
and creates a fresh private binding before any provider preparation.

A same-Tenant Site-to-Site move retains occupancy and shared provider project.
Both Sites' manage/activate permissions are required. A source Primary needs a
qualified replacement, destination role is unselected, and one adverse Moving
generation precedes the atomic source/destination/global-head transition. No
DNS, TLS, registrar, email, Vercel-project, content, Giving, or money migration
occurs.

The Domain Move Route Review compares complete immutable effective-host
manifests using a separate small, versioned, code-owned Domain Critical Owner-
Family Registry and pure deterministic algebra. A family is critical when wrong
routing could accept/reinterpret money or another protected durable effect;
authenticate, authorize, establish trusted origin, or complete a callback;
invoke an API, form, provider control/result, or protected action; choose
Domain/root/locale-root/canonical-origin/public admission authority; or bypass
safety, privacy, cache/admission, or route reservation. Each entry has a stable
family key, contract version, precedence, evidence-head reader, finite result
vocabulary, privacy projection, and required tests. It may share typed adapter
infrastructure with the Site Locale Publication Contract but not membership or
authority. Missing, hidden, stale, contradictory, or blocking critical evidence
stops. Source-only ordinary routes compile permanent real-not-found effects;
different-Page collisions require D78 or a new destination path.

The Vercel adapter is one narrow owner adapter, not a generic provider
framework. It normalizes proved present/absent, pending, rate-limited,
contradictory, and unknown. Operations are exact-resource/idempotency keyed,
coalesced, and honor current headers/documented limits. Provider state never
becomes a current product role or claim.

## Translation, Copy, And Page Continuity

Translation provenance is explicit: Translated pins one compatible authoritative
Basis; Independently authored has none; legacy remains unclassified. Ordinary
source drift derives Out of date but keeps the reviewed target public. A
registered source successor requires an initially unselected Keep reviewed
translations public / Make affected translations unavailable safety
disposition. An existing explicit source-owned adverse-only revocation command
may immediately request the same typed, server-derived, adverse-fence-first
smallest complete closure. Neither path creates a central classifier or
translation workflow.

Suggested translation sources are an optional, partial, same-Site authoring
order. It changes no authorization, provenance, public fallback, route, SEO,
cache, message, Giving, or money behavior. At point of use, authorized source
locales remain available even if omitted.

Copy may expose at most exact Latest saved draft and Current published version
logical heads. Latest saved draft is the exact current server-acknowledged D12
Working Revision; Current published version is the exact source revision pinned
by D1's current authorized public generation. Unsaved, in-flight, outcome-
unknown, conflicted, superseded autosave, schedule, restored-history, prior-
publication, provider-latest, and arbitrary-version records are excluded. Equal
compatible input collapses to the public row only when that public head
independently qualifies. An exact-revision, purpose-specific Copy Qualification
proves a finite exhaustive treatment for every input. Unknown, lossy,
unclassified, silently omitted, or zero-effect input is unavailable. Qualified
source findings remain visible but non-gating. A selected private head creates/
reuses an immutable protected checkpoint. One transaction creates one
independent private target and Basis or nothing; it never overwrites.

D78 different-Page ordinary continuity is one immutable directional fixed-pair
qualification after structural proof and explicit human same-subject,
substantive-purpose, and visitor-task judgment. Qualification creates prepared
evidence and a receipt only—no redirect, route, generation, content, Page,
Domain, Vercel, or donor effect. Only the owning domain-move/publication command
may consume it after rechecking every pin. After activation it pins a sparse
Page Purpose Continuity Version. Meaning-bearing release change adds one
unselected keep/change-purpose choice only when necessary.

A declared material-purpose candidate cannot publish through the source Page.
One contextual command seals the exact source candidate and creates a fresh
private Page through the existing finite transfer and placement owner. In one
transaction it records protected source checkpoints, cleans only changed Page-
owned draft axes, fences old leases, creates/adopts the target placement when
safe, re-derives the complete private descendant closure, and resolves sibling
position from explicit valid provenance or positively recorded append-last
default. It creates exactly one target or no authoritative effect; source public
state, history, continuity, Navigation, schedules, donors, providers, and money
remain unchanged.

## Currency And Donor Gift-Intent UX

Site policy stores default and enabled presentment intent. Payments produces
immutable, expiring, provider-neutral offering-envelope qualification for exact
live financial route/mode cohorts and any already-known cadence/rail. Setup
checking is read-only and creates no Stripe object or setting. Save requires at
least one qualified route and matching policy/evidence fingerprints. Amount and
payment-method eligibility is evaluated as those facts become known, and
checkout independently re-proves the exact cart, amount, cadence, payment
method, account/binding, provider contract/config generation, limits, and
currency immediately before the first provider effect.

For a pristine intent, resolution is existing explicit choice, eligible local
country-level suggestion, qualified Site default, then explicit remaining
choice. One cart uses one currency. Locale, browser language, URL, profile,
cookie, provider global support, or location never authorize it.

A currency transition preserves the exact target-valid schedule identity and
revalidated currency-independent purpose/unaffected intent. A schedule
transition preserves the exact cart currency and schedule-independent purpose/
unaffected intent. Once any material amount/fee/payment/provider state exists,
the complete source revision remains authoritative until an accessible
consequence-specific confirmation succeeds. The command clears the smallest
complete affected closure, fences old attempts, and makes target amount
unanswered. An incompatible preserved axis writes nothing; neither transition
silently clears or substitutes the other. Neither performs FX, digit carry,
preset-position mapping, proration, or accepted-record mutation.

Suggested Amount Sets are reviewed native Site presentation: zero to six unique
positive ascending values per currency/cadence, plus custom amount and no
automatic choice. Empty is custom-only. Set changes apply only to new pristine
views and never rewrite carts or historical money. Deliberate currency/cadence
disablement retires its set from public use; re-enable remains custom-only until
staff explicitly reaffirm a successor. Transient qualification loss preserves
the set but never bypasses qualification.

Phase 24 assumes exactly one active Giving Legal Entity and one current Tenant-
owned connected-account binding per Tenant/environment. The normalized Legal
Entity/binding model remains; a second active lane is unavailable and no
platform-account fallback exists.

## Staff Information Architecture

Use existing Base Maia patterns and persistent Tenant/Site context. The Site
workspace provides Overview, Domains, Languages, Currencies, Website appearance,
and Availability. Healthy summaries are quiet; exception-first detail expands
blockers and exposes one owner-authorized next action. Technical provider values
stay in bounded Details where permitted.

Use consequence-labelled action buttons, not toggles, for public/destructive
effects. Reviews show exact before/after and explicitly unchanged facts.
Cancel/keep-safe receives initial focus. Applying/Publishing/Moving/
Disconnecting/Confirming outcomes persist through reload until authoritative
readback and offer receipt-backed recovery.

The Copy Sheet contains an unselected qualified RadioGroup followed immediately
by Unavailable source versions. Disabled rows are not choices; nondisclosable
heads are absent. With no qualified source, Start blank draft is direct primary.

All experiences meet WCAG 2.2 AA, keyboard/screen-reader/touch use, 320 CSS
pixels, 400% zoom, forced colors, reduced motion, native language naming,
RTL/bidi isolation, CJK wrapping, IDN-safe display, explicit time zones, and
weak-network/reload recovery.

## Database, RLS, And Privileged Paths

Operational records use full Tenant and required Site/locale/owner keys,
same-scope foreign keys, non-null identity, unique/check constraints,
restrictive deletion, and immutable history. Browser roles receive no direct
authoritative DML. RLS supplies structural `USING` and `WITH CHECK`; permitted
updates cannot move rows across scope.

Views are invoker-safe. Security-definer functions pin `search_path`, accept
only narrow typed business inputs, derive actor/scope, and reauthorize. Service,
worker, Payload, import, support, and owner paths that may bypass RLS must invoke
the same command boundary and pass hostile cross-Tenant poison tests. A service
key is never authorization evidence.

Environment isolation currently comes from separate Supabase projects/
databases. If that changes, environment must enter Site and every dependent
structural key in one migration before sharing; cache or application convention
cannot substitute.

## Public Read And Cache Design

Public reads resolve trusted host to one exact admitted Site/domain generation,
then read the exact immutable public generation through the published-content
boundary. No provider or mutable-latest CMS call occurs in the public request.
Cache keys contain the full Tenant/environment/Site/host/locale/base/generation/
owner/resource/audience/renderer scope; tags invalidate but never isolate.
Private, preview, unknown, adverse, and authorization-sensitive results are
`no-store`.

An adverse-first compact edge projection may deny before React streaming but
is never sole authorization. Exhaustion or contradiction denies instead of
scanning Postgres from middleware or broadly allowing.

## Failure, Recovery, And Audit

Pre-commit failure changes nothing. Post-commit secondary failure leaves the
authoritative head/receipt intact and resumes only unresolved outbox effects.
Unknown provider success never releases a host, reopens serving, or starts a
new payment. Staff see the owner, bounded reason, last checked/attempt time, and
one recovery action without raw secrets or foreign existence.

Technical logs/traces, append-only business history, security audit, and staff-
visible operation receipts are distinct but correlated. Logs and receipts are
PII-minimized and never include DNS secret challenges after use, provider
secrets, payment credentials, donor bodies, or restricted ministry content.

## Migration And Rollout

1. Census Sites, hosts, routes, locale fields, CMS heads, Money readers,
   callbacks, caches, providers, and historical claims; quarantine unknowns.
2. Reconcile Phase 23-equivalent owners and deploy additive canonical readers,
   constraints, receipts, negative occupancy, and adverse fences.
3. Fence all old null-Site, host-blind, locale-array, unprefixed favorable,
   mutable-latest, USD/two-decimal, and direct-provider writers.
4. Shadow deterministic manifests, qualifications, and public generations;
   compare without favorable effect.
5. Activate explicit Tenant/Site/domain/locale/currency cohorts only after the
   complete proof matrix passes.
6. Rollback disables new writers/actions, retains history/claims/receipts and
   adverse state, and reconciles forward. It never re-enables old writers after
   new durable facts exist.

## Testing Architecture

The primary proof seam extends the existing strict local CMS E2E runner into
one real Payload/Postgres staff-to-donor/public tracer. Actual local HTTP
runtimes are the oracle for host resolution, methods, status, headers,
redirects, cookies/auth origin, cache/admission, donor UI, and reload behavior.
The transport-agnostic published-content reader is the oracle only for exact
generation/content selection. Injected owner adapters and durable database
receipts prove Vercel, DNS, Stripe, and no-effect outcomes. This remains one
browser harness.

Lower seam one tests pure command/domain/provider contracts with injected
owner adapters and discriminated outcomes: lifecycle, Money, gift transitions,
manifest comparison, locale/copy qualification, Payload head selection, Vercel
normalization, and side-effect-free Stripe qualification.

Lower seam two applies real migrations to disposable Postgres and proves
constraints, grants/RLS, privileged parity, CAS/concurrency, idempotency,
receipts/outbox, failpoints, restrictive deletes, mixed versions, and hostile
cross-Tenant scope. SQL-text matching is not proof.

Accessibility, mobile, RTL/CJK, no-JS, weak-network, focus, load, and moderated
staff/donor comprehension attach to the vertical tracer. Real-provider tests
qualify exact environments/contracts but never replace deterministic proof.

## Risks And Resolutions

- **Phase 23 substrate drift:** block dependent writers until an accepted
  equivalent is reconciled; do not copy unmerged names as authority.
- **Provider ownership drift:** store exact evidence generations and reconcile;
  fail closed and preserve Core claims/barriers.
- **Critical-inventory expansion:** keep the code-owned inventory finite and
  require new universal owners to classify themselves in the same change.
- **Schema breadth:** keep owner records separate only where invariants and
  lifecycles differ; avoid generic settings/status/workflow tables.
- **Public performance:** compile immutable generations and compact host
  admission; no Payload/provider/qualification call on public requests.
- **Operational burden:** every exception has a durable receipt and one owner
  action; no normal path requires support or direct SQL.
