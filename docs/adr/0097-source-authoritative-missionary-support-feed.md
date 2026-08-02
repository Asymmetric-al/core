# ADR-0097: Source-authoritative missionary support feed

**Status:** Accepted (founder ruling, Phase 21 grill session — D8)

Phase 21 owns its existing finance-safe Missionary Support Activity Projection,
separately through-dated per-currency Support Balances Projection, and their
closed external field floor. Phase 14 and Phase 16 remain the underlying
supporter/recognition and commitment authorities already composed by Phase 21.
Phase 28 may later contribute only separately ratified, independently versioned
relationship/contactability resource families; it never becomes supporter,
contribution, commitment, or Field Account authority.

Phase 31 owns one disposable, rebuildable, versioned **Missionary Support Feed
Projection** composed exactly once from those authorized Phase 21 inputs and
any later ratified Phase 28 family. The feed is not another supporter CRM,
contribution ledger, Field Account subledger, accounting source, migration
store, or provider-owned truth. Phase 30 remains the inbound migration owner,
and Phase 20 remains the sole accounting doorway.

Phase 31 also owns prospective feed Subscription Versions, provider
authorization, Coverage Manifests, transport, cursor state, PII-free
reconciliation hints, capability-certified provider serialization, connection
health, backpressure, and delivery evidence. Each Subscription Version binds
exactly one Tenant, Legal Entity, destination organization/product/environment,
recipient, Missionary Support Feed Subject, purpose, Designation or Field
Account scope, resource and closed field-set version, bounded history horizon,
currencies, schema, adapter certification, and authorization epoch. A bulk setup
creates independently authorized Subscription Versions and feed, cursor, and
pseudonym namespaces for each pairing of recipient and Missionary Support Feed
Subject; no data cursor or stable reference spans recipients. A cursor never
grants authority. Current server-side
authority is re-proved before every read and queued egress, and scope
contraction denies future positive egress before downstream cleanup.

D1-D7 remain binding projection constraints. The feed exposes only the exact
source-authorized activity and Finance-confirmed balances already produced by
Phase 21. It never exports or re-evaluates Support Close Readiness, source
settlement, payout, bank, accounting, assessment-policy, compensation-funding,
reimbursement-obligation, payroll-draft, provider-operation, payment, or
availability authority. D3 assessment presentation is copied from the
source-owned result and never recalculated. D5 corrections, reversals, and
reallocations remain append-only occurrences and complete atomic groups; open
or provisional work cannot change a D1 Finance-confirmed balance. D6 amounts
remain exact, ISO-labelled, independently through-dated currency lanes with no
authoritative converted aggregate. D7 payroll grants, connections, adapters,
operations, and evidence remain structurally separate from Phase 31 feed
authorization.

Bootstrap uses one immutable **Missionary Support Feed Coverage Manifest** with
an atomic `snapshot_through` cut, exact inclusions/exclusions, bounded history,
field and currency scopes, adapter/schema versions, and per-required-source
coverage watermarks. Complete means structurally complete only within that
manifest and cut; current freshness is a separate state. All pages read the
same generation. Changes after the cut begin strictly after
`snapshot_through`, so every occurrence is in the snapshot or first change
round and never neither.

Resumable page cursors and the terminal change cursor are distinct. Only the
terminal snapshot page yields a change cursor. The server checkpoint is
monotonic, but cursor values are opaque, authorization-, query-, schema-, and
epoch-bound, replayable, finite-lived, and non-sortable. Cursor order is
transport order, never effective financial chronology. Expired, incompatible,
or scope-obsolete cursors return `410 Gone` with an RFC 9457
`cursor_reset_required` problem and start a newly cut bounded snapshot; no
consumer may guess a date.

Delivery is at-least-once. Every change has an immutable subscription-scoped
delivery event ID, a destination-recipient-scoped entity reference, a monotonic
per-entity version, a typed projection operation, the full current authorized
representation, source authority/version, and exact ISO currency plus integer
minor-unit money where relevant. Any source occurrence identifier stays
internal or is replaced with a recipient-scoped pseudonym; no source-global
correlation key leaves Asym. A source financial correction or reversal emits a
new immutable projected occurrence linked to the original; a projection
operation never rewrites source financial history. A related change group includes its
complete membership count and digest, is delivered wholly in one page, and is
applied atomically. A group that cannot be delivered completely blocks
checkpoint advancement instead of leaking a partial D5 pair or balanced
effect. Signed notifications, where supported, carry no PII or amounts and are
wake-up hints only; pull and scheduled reconciliation remain authoritative.

Authorization, anonymity, and publication safety apply before enumeration,
counts, arithmetic, pagination, cursor assignment, caching, hints, logs, or
diagnostics. Visible durable records use destination-recipient-scoped
pseudonymous references. Anonymous or private gifts may retain only occurrence
identities required for correction and deduplication; they never receive a
stable hidden Party identity. The Phase 14 missionary field floor and
never-leak fixtures remain binding across snapshots, changes, tombstones, and
cross-period differencing. Recognition never implies Phase 28 contactability.
Restricted or high-risk workers are excluded from ordinary activation.

A recipient-only revocation envelope may refer only to a pseudonymous object
that the same subscription previously disclosed. It means only that the
recipient can no longer receive or access that projection object through the
subscription. It neither reveals the current identity or reason nor directs or
proves the recipient's legal right or technical ability to retain a provider,
local database, export, or backup copy. Product truth therefore distinguishes
future subscription access denied, revocation delivered,
provider-confirmed removal, removal unsupported, and downstream outcome
unknown.

Provider support is capability- and direction-honest. TntConnect is supported
only through an exact vendor-authorized, production-certified DonorHub pathway,
and MPDX only for explicitly authorized installed-base organizations. A logo,
query API, local adapter, sandbox, or inferred protocol is not production
authorization. No mapping may flatten unlike currencies, unsupported
commitments, recognition paths, privacy semantics, or authority states;
unsupported meaning is omitted with exact disclosure or blocks activation.

No adapter, provider label, or Subscription Version may be
production-authorized until the provider-neutral conformance suite and exact
provider certification suite pass. The common suite proves D1-D7 authority
darkness; complete-versus-fresh snapshot semantics; recipient, Tenant,
Legal-Entity, destination, purpose, Field Account, currency, field, history,
and authorization-epoch isolation; terminal-cursor, replay, crash, reset, and
non-destructive resnapshot behavior; append-only corrections; complete atomic
groups; exact currencies; privacy-floor and cross-snapshot differencing
resistance; current-grant enforcement; PII-free hints; fair backpressure; and
redacted operations evidence. Provider certification pins the exact product,
version where observable, region, environment, direction, production
organization, authorization, schema/capability, semantics, history, limits,
volume, proof owner/date, expiry, and suspension trigger, and proves that
fetch, acknowledgment, revocation delivery, or disconnect is not silently
called downstream application or erasure.

This decision deliberately rejects raw-table or arbitrary-field access,
all-history defaults, cursor-as-authorization, global or stable anonymous Party
identifiers, bidirectional gift/contact writes, duplicate ledgers or CRMs,
date-only recovery, destructive merge, uncontrolled exports, false
synchronization or deletion claims, authoritative converted totals, and any
claim that support is available, withdrawable, payroll-ready, payable, or
paid.

## Phase 21 D19 terminology and access amendment (2026-08-01)

D8's former feed **participant** means the exact Phase 21 **Missionary Support
Feed Subject**, now defined as one organization-controlled Support Assignment.
It is not a Party participant or an authorization role. Every external
recipient remains separately identified and Phase 12-authorized; a Support
Assignment Participant Membership alone grants no feed access. One Party
associated with several Support Assignments therefore has separate subject/
recipient subscription namespaces, coverage, cursors, pseudonyms, and
revocation.
