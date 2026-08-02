# ADR-0041: Contract-derived statement fulfillment and containment

**Status:** Accepted (founder rulings, Phase 19 grill session — D6-D9, D13, D16)

> Full record:
> `docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md`

## Context

Tenants need meaningful control over email, portal, print, Site, locale, and
fallback behavior. Encoding that control in tag queries, first-match rules,
manual lane membership, or provider-specific status creates brittle,
unexplainable routing. Mutable destinations and blind retry create duplicate or
misdirected delivery. At seasonal volume, staff also need truthful Pause,
Resume, Stop, and privacy containment across document, message, portal, and
physical handoffs.

Self-print will be the common physical method. Connected mail must not become a
prerequisite or a second document pipeline.

## Decision

Tenants publish immutable Statement Delivery Profile versions and assign them
at supported organization, Site, and recipient-preference scopes. Profiles
choose a primary route, behavior when unavailable or terminally failed, paper
method, portal posture, and the finite statement communication posture. They
may support deliberate digital-and-paper delivery. There is no arbitrary low
profile cap, routing DSL, saved-query authority, scoring model, or manual lane
editor.

One code-owned resolver compiles each Recipient Document Operation into one
frozen Fulfillment Plan and mutually exclusive execution lanes. Legal, privacy,
recipient-authority, consent, suppression, and safety constraints outrank
tenant settings. An authorized reasoned run-only change outranks explicit
frozen recipient preference, which outranks Site assignment, which outranks
organization default. Equal-specificity conflict has no arbitrary winner. A
transient channel failure never activates paper; only a terminal outcome may
activate an already-frozen compatible fallback.

Release freezes recipient authority, selected destination revision, locale,
Site, route, and a safe digest. Current authorization and safety remain live.
A destination changes only through append-only succession with CAS, current
proof, a new semantic occurrence/provider identity, and reconciliation of any
submitted or indeterminate predecessor. Destination-only change may reuse exact
artifact bytes; a value printed inside the PDF changes only through source
correction and a Phase 18 successor. Provider address changes never overwrite
the CRM.

Self-print is the default physical method. Phase 19 prepares secure, expiring
packages of exact Phase 18 artifacts with deterministic manifests, piece/page
counts, opaque names, digests, chunk checksums, print profile, and safe duplex
separation. Prepared and downloaded do not mean printed or mailed. Staff record
all-success or partial print evidence and a separate postal-handoff
attestation. Existing mail houses use the same exact-artifact package and
truthful custody states.

At most one connected direct-mail adapter may become Live after security,
privacy, custody, exact-artifact, sandbox, reconciliation, webhook,
cancellation, coverage, rate, outage, and exit proof. PostGrid is the first
evidence candidate; Lob is the U.S.-focused alternative. Neither provider name
or status becomes core domain truth.

Provider connection administration and paid-lane authorization are separate
capabilities. Activation requires a tenant-set maximum spend per run. Every
paid preflight freezes exact pieces, billing currency, a current provider quote
or certified upper bound, expiry, and the tenant guard. If cost cannot be
bounded, is stale, or exceeds the guard, Start blocks. The one existing Start
confirmation authorizes later service execution within those exact bounds; no
second staff purchase dialog or per-piece approval exists.

At execution, a fresh bound may proceed only at or below the latest reviewed
ceiling and inside the cumulative guard. A credential-only rotation inside the
same logical provider account and capabilities is re-proved without changing
semantic authorization. A higher bound or compatible material connection
revision creates one exception-only, exact-remaining-pieces reauthorization
with explicit old/new cost; incompatible changes, disconnects, stale evidence,
and over-guard work remain blocked. Reauthorization never changes population,
route, submitted work, or provider outcome.

One monotonic run control row and epoch fence every irreversible handoff:

- Pause closes admission in O(1), then settles old-epoch work before claiming
  containment.
- Resume opens only proved-safe remaining work under a new epoch.
- Stop permanently prevents every unclaimed operation and every claimed
  operation that has not crossed its serialized irreversible-handoff fence; it
  never pretends to undo prior work.
- Urgent privacy containment closes the same fence immediately, revokes
  provably unsubmitted material, attempts supported cancellation, and links the
  owning incident.

In-flight or externally accepted work may still complete or reconcile. Every
old-epoch crossing after a control command won is an invariant violation.

Statement communication is a finite Phase 19 producer contract executed only
through Phase 17/6: ordinary ready, proved correction/replacement,
purpose-required withdrawal, deliberate additional copy, and grouped staff
attention. Portal publication, print readiness, progress, internal retry,
provider acceptance, and run completion create no donor message. Phase 19
never calls Resend directly or stores another communication ledger.

Donors may view, download, range-read, and locally print exact current bytes
without a product quota or copy record. Each request reauthorizes the current
head and exact object generation. A deliberate **Send another copy** creates
one bounded occurrence; equivalent unresolved requests deduplicate, while a
later deliberate request after terminal resolution is permitted.

## Consequences

- Delivery configuration remains flexible and explainable through **Why this
  route?**, synthetic preview, and aggregate impact.
- Current contacts do not silently retarget reviewed work.
- Provider timeout or webhook ambiguity cannot trigger blind duplicate mail.
- Print evidence distinguishes package, download, print, transfer, production,
  postal handoff, return, and unknown outcome.
- NCOALink-to-CRM remains separately groomed future scope.
- All exact destinations are encrypted and purpose-bound; generic evidence,
  logs, metrics, events, and filenames are PII-minimized.
- Phase 17 remains message/delivery authority; Phase 18 remains
  document/artifact authority; Phase 19 owns physical fulfillment and control.
- Resend batching, rate limits, and provider cancellation windows are adapter
  capabilities, not product constants.

## Phase 21 D26 precision amendment (2026-08-02)

A D26 staff-facing PDF/HTML/print representation is not a Phase 19 Audit
Package, donor statement copy request, Statement Run, print-production package,
postal handoff, return, or fulfillment outcome. Phase 19 retains statement
delivery and physical-fulfillment authority. For Phase 19 fulfillment content,
D26 may export only a currently authorized exact Phase 19 owner copy or
reference. D26 may separately include an authorized owner-domain reference or
exact copy for an independently owned artifact, including a Phase 18-generated
document, under that owner's current authority and D26's Coverage Manifest.
Neither path creates recipient delivery evidence; download or print does not
prove production, handoff, delivery, receipt, or statement-currentness.
