# Design: Canonical Document Production

## Decision Authority

This design implements Phase 18 D1–D17 and ADR-0033 through ADR-0039. D17 is
controlling where an earlier decision discussed migration or compatibility: the
target is one clean pre-production system with no legacy runtime, importer,
backfill, compatibility view, or fabricated history.

The exact production renderer remains evidence-owned. This design establishes
the contest and renderer boundary; it does not name a winner before the D3
charter and corpus pass.

## Bounded Context And Product Surface

Document Production is one bounded relational module exposed through one
product-level Generated Document service. It uses the existing `pdf_*` naming
family only where final semantics are clean. It does not preserve a prototype
shape merely because the name exists.

The staff product has three destinations:

- **Templates** — purpose catalog, drafts, proof, publication, assignments, and
  at most one future appointment per publication head;
- **Documents** — one current-first logical-document projection with a calm
  timeline, role-bounded evidence, correction, exact copy, access, and records;
- **Batches** — item-authoritative preflight, progress, mixed outcomes, and
  grouped repair.

`Needs attention` is a saved projection over cause-owned terminal conditions.
It is not another state machine, queue product, or notification system.

## Durable Authorities

### Document Purpose Contract

A code-owned, versioned contract identifies the purpose, lane, jurisdiction,
document class, eligible source authority, Approved Data View, protected cases
and blocks, recipient binding, output policy, publication/review floor,
resolution candidates, legal pack, access routes, records schedule, and release
gates. A purpose contract supplies rules; a tenant cannot edit law or safety.

### Document Definition Publication

A stable template root owns mutable CAS drafts. Commit creates an immutable
candidate; publish creates an immutable complete publication graph and advances
one structurally scoped head by compare-and-set. The graph pins structured
content, schema/compiler, purpose/data-view contracts, fields, cases,
collections, locale, reusable components, assets, fonts, output profile,
renderer compatibility, proofs, review, and dependency generations.

### Facts Package

The source domain builds one immutable, typed, purpose-scoped package from
current authorization and source truth. It has a stable source reference,
schema/version, canonical hash, privacy/safety generation, recipient and subject
roles, bounded collections with stable row identity/order, raw structured values
where needed for validation, and frozen official display values where the source
owns formatting. Null, absent, withheld, ambiguity, and overflow are distinct.

### Generation Request

One semantic operation identity plus immutable command hash owns one request.
The service derives tenant, environment, issuer, actor, purpose, recipient,
source package, and scope server-side. Resolution and freeze atomically pin the
complete publication graph and all current contract, review, authorization, and
safety generations. Reuse with identical pins returns prior work; reuse with a
different command hard-conflicts.

The product states are `queued`, `generating`, `ready`, `needs_attention`, and
`canceled`. Internal attempt stages and source issuance/delivery qualifiers do
not create tenant-configurable product states.

### Render Attempt

Attempts are append-only technical evidence beneath one request. A claim uses a
lease, immutable provider deadline derived from database time, monotonically
increasing fencing token, attempt-scoped private staging path, and bounded retry.
Provider response, deadline, operator cancellation, lease loss, staging, and
canonical promotion use current-token compare-and-set transitions. A stale or
losing worker can clean only its own staging object and cannot alter canonical
state.

### Issuance

Issuance is optional. Its source domain owns eligibility; whether and why an
official issuance or document identity is required; exact issuer, recipient, and
coverage facts; issuance validity; and correction/cancel/void/replace
authorization and effect. It supplies one frozen authorization/intent, never an
allocated Phase 18 identifier.

The Phase 18 code-owned jurisdiction/identity contract owns `ACK-*` generation,
exact-issuer `ca_r_v1` allocation, reuse/nonreuse and disposition mechanics, and
artifact linkage. Only the Generated Document service may allocate after request
admission and freeze and before identifier-bearing render. Templates, renderers,
clients, staff, and source-domain commands never allocate. A mechanical
reservation outcome cannot decide legal issuance validity or correction effect;
those remain source-authorized.

### Artifact

One request/output policy yields zero or one canonical artifact. Promotion
requires final bytes, required machine and human-qualified validations,
SHA-256, byte length, opaque never-reused object identity, storage generation,
private upload, independent read-back, current request token, and atomic
one-canonical-artifact enforcement. Historical access always returns stored
bytes, never a rerender.

### Logical Document

A logical document groups the source-defined purpose/issuer/recipient/coverage
chain and its immutable publications. The head is a rebuildable mutable
projection constrained to at most one current eligible publication. Correction
creates a source-authorized successor and atomically updates the head only after
the successor artifact is valid. Evidence history remains subordinate.

### Delivery

Phase 17 owns message resolution, preparation, submission, consent, provider
events, and communication history. It receives an exact artifact reference and
protected-action presentation descriptor. It cannot render or retain official
bytes as history. Delivery failure never changes issuance or artifact truth.

## Authoring And Data Contracts

The canonical source is one structured, engine-neutral visual document. Its
closed block vocabulary supports text, approved information, bounded tables/
repeaters, images, headers/footers, page and section roles, protected purpose
blocks, and safe links. It forbids executable source, arbitrary HTML/CSS/JS,
queries, formulas, remote fetch, filesystem access, plugins, and recursive
layout/data behavior.

The editor and accessible outline operate on the same source. Protected truth
is the smallest source-owned semantic unit and cannot be removed, hidden,
contradicted, reordered out of its required role, or conditionally suppressed.
Preview and proof use versioned synthetic fixtures, including maximum content,
English/French, RTL, CJK, missing values, long collections, page boundaries,
restricted identities, and adversarial assets.

Approved Data Views reuse Phase 11 field identity, type, classification,
recipient binding, and custom-field catalog. A tenant availability choice may
only subtract from policy. One root subject, finite named roles, bounded ordered
collections, and a tiny optional-content predicate set replace arbitrary object
traversal. The compiler resolves only referenced fields and emits one frozen
Facts Package before renderer execution.

## Publication Resolution And Appointment

Normal configured assignment/inheritance resolves first. If the expected primary
is unusable and the purpose permits recovery, a closed shallow resolver checks
one affirmatively compatible prior publication at the same scope and exact
locale, then one purpose-permitted ancestor publication at the exact locale.
The first compatible candidate wins; if evidence marks both compatible, the
prior publication wins deterministically. Every dimension must pass and unknown
blocks. System publications, sibling Sites, foreign-language or foreign-locale
variants, tenant-reordered recovery, and fragment mixing are forbidden.

Resolution and request freeze are one admission operation. After freeze, every
retry uses exact pins. Safety may stop unissued work but cannot mutate it. A
separate successor request is permitted only after no-artifact/no-issuance/
no-ambiguity proof; it preserves the logical document, Phase 18-owned reference/
serial disposition, and source-owned issuance/correction effect.

Immediate publication is primary. One immutable future appointment may target a
publication head. It binds candidate, expected head, civil date/time, IANA zone,
displayed offset, UTC instant, exact proof/review, and governance generations.
Activation uses the same publication command and a due-request barrier. Failure
leaves the prior head and creates one grouped exception. Frozen work never
changes pins.

## Renderer And Output

The evidence contest freezes exact candidates, deployment, corpora, validators,
budgets, hard gates, scorecard, and reviewers before judging output. It yields
one production winner or no winner. Chromium remains preview/control. No losing
runtime or tenant renderer selector ships.

The purpose selects `accessible-v1` or `accessible-archive-v1`. Every artifact
is one accessible PDF; archival requirements add conformance to the same bytes.
Finalization is render → byte-changing final steps → exact validation → product
accessibility checks → hash → private store → read-back → atomic promotion. A
delivery route cannot transform, wrap, compress, encrypt, sign, or rerender the
canonical bytes.

## Jurisdiction Packs

### United States

The U.S. pack maps each source-approved contribution to exactly one everyday
case, specialist obligation, non-tax communication, or typed unsupported reason.
It covers the Phase 18 D8 cases without representing specialized IRS forms as an
ordinary acknowledgment. Threshold and protected-language decisions use source
facts and pack rules, never template conditions.

The logical acknowledgment reference is `ACK-XXXXX-XXXXX`; its ten Crockford
Base32 characters are server-generated from unbiased CSPRNG bits and protected
by a named global uniqueness constraint with bounded collision-specific retry.
Correction keeps the base and increments immutable `vN`. The reference is never
authorization.

### Canada

No Canadian runtime state exists without a deliberate issuer-bound activation.
The four-task setup proves registered-charity issuer, receipting privilege,
issue locality, records/custody posture, language/template readiness, exact
signer, safe initial serial position, secure artifact/access route, and current
qualified release evidence.

One full registration account owns one active `R-` lifetime series and one
current signer plus at most one successor. Allocation is a short issuer-local
transaction, never a batch-range lease. Every reserved ordinal is non-reused and
has a typed disposition. Formal replacement creates a new serial and cites the
retained cancelled predecessor. A failed successor never cancels the prior
current receipt first.

The signer mark is a private sanitized asset outside Brand Kit and templates.
Every issuance pins and re-proves the exact authority interval. Exact artifact
integrity and purpose-required WORM/audit evidence are required; tenant PKI and
per-receipt platform signatures are not.

## Exact Access And Protected Handoff

Authenticated portal access reauthorizes tenant, environment, issuer, purpose,
Party/representative, authority epoch, logical current head, artifact integrity,
and records/access state on every request.

Phase 18 amends the shared Phase 17 protected-action primitive once for every
producer; it does not fork a document token system. Every protected action uses
one trusted Asym URL with a non-secret selector in the HTTP URL and an independent
256-bit verifier in the fragment. A minimal first-party, third-party-free landing
script immediately removes the fragment from browser history and submits it only
on one deliberate same-origin CSRF-protected POST. The server stores only a
versioned verifier digest/HMAC. There is no query-string or raw-path-secret
fallback. GET, HEAD, scanners, previews, crawlers, tracking, the selector alone,
and failed verifiers disclose no protected fact, touch no protected resource,
consume no grant, create no authorized session, and prove no human intent.

The shared exchange re-proves the producer-owned purpose contract, tenant,
Party or other purpose-owned subject, exact protected resource, current
authorization, expiry, revocation, and replay state. The document producer then
adds environment, exact issuer, logical document/current head, recipient/contact
authority epoch, artifact health, and records/access checks. Success creates a
bounded document-purpose host-only HttpOnly cookie/session. Routine replacement
uses a bounded first-use-wins overlap; security revocation is immediate.

The landing page CSP allows only the reviewed nonce- or hash-pinned minimal
same-origin script; third-party scripts, analytics, remote resources, and service
workers are absent, and `Referrer-Policy: no-referrer` is set. Every protected
landing, redirect, error, session, full-file, and range response sets
`Cache-Control: private, no-store, no-transform, max-age=0`,
`CDN-Cache-Control: no-store`, and `Vercel-CDN-Cache-Control: no-store`.
All file and range responses stream the exact private object; raw storage URLs
never reach clients. A production deployment probe through the actual
Vercel/CDN and supported mail-client/scanner matrix proves header preservation,
no caching/transformation, exact generation for full/range responses, fragment
absence from server/edge/provider logs, and inert repeated GET/HEAD requests.

Resend tracking is off and drift-gated for capability-bearing messages. Provider
and access events remain precise; no event claims a human read the document.

## Records And Disposal

The purpose binds one effective-dated Records Schedule Contract with seven
closed obligations and typed triggers. Preservation floors and privacy ceilings
are independent. Conflicts require review. Tenant extensions are bounded and
cannot weaken floors or exceed ceilings without reviewed lawful basis.

Holds are scoped, evidence-bound, monotonic, reviewable, and explicitly
released. They never broaden access or auto-expire. Disposal serializes with
holds and follows restrict → grace → final CAS reproof → exact-version destroy →
backup expiry/suppression → verify. Restore replays the forward-only suppression
journal before reads. Phase 18 coordinates with other owners and never cascades
deletion into their facts.

## Batch And Operational Model

Single and batch paths call the same Generated Document service. A batch freezes
its source-owned item set/cutoff, candidate policy, publication graph, and item
operation identity before identifiers are reserved. Each item has independent
state and artifacts. Retry-failed-only excludes success and ambiguity.
Root-cause grouping, tenant-fair claims, bounded concurrency, deadlines,
backpressure, poison isolation, and production-shaped seasonal load are release
requirements. Phase 19 owns annual population and run scheduling.

Diagnostics use stable PII-safe stage, reason, owner, version, generation,
digest, count, age, and correlation identifiers. Staff see one cause and next
action. Technical details are permissioned. Reconciliation covers stuck
requests, stale attempts, orphan staging, missing/corrupt artifacts, head drift,
serial/coverage invariants, grant/session drift, appointment backlog, records
holds/disposal, and restore suppression.

## Clean Pre-production Cutover

Before destructive work, one server-authoritative command proves the environment
is non-production and checks for real tenants, irreplaceable artifacts, external
dependencies, and relied-upon prototype history. A positive or indeterminate
finding stops the line for explicit re-grooming.

On the proved disposable environment, rebuild directly to the final schema and
remove every alternate receipt/statement/template writer and reader. Do not
create a migration manifest, importer, compatibility table, legacy archive,
dual-path feature flag, or user-facing cutover workflow. After cutover,
repository and runtime inventories must prove exactly one production seam.

## Test Architecture

The primary test seam is the Generated Document service: submit a tenant- and
actor-scoped request with purpose, source facts/issuance-authorization reference,
and semantic operation identity; observe the logical document, product state,
timeline, current head, Phase 18 identity/disposition where applicable, and
authorized exact artifact.

Three subordinate proof seams are unavoidable:

1. the renderer conformance harness against the frozen D3 corpus;
2. real Postgres/Supabase integration for RLS, constraints, idempotency, serials,
   claims, CAS, immutability, holds, and disposal; and
3. thin Next.js/component/Playwright tests for authorization, no-store/download
   behavior, one-document UX, role surfaces, and accessibility.

Service tests may fake renderer, private object storage, clock, and ID sources
deterministically. Database invariants use the real database. Prototype direct
preview/render and text-download routes are removal targets, not test seams.

## Explicit Non-goals

No microservice fleet, generic event sourcing, tenant legal-rules DSL, arbitrary
CRM query/formula/ETL language, Word/Canva clone, workflow builder, file manager,
records suite, eDiscovery product, PKI console, renderer chooser, multi-output
graph, release calendar, generic migration/import platform, second delivery
history, or second statement-run engine.
