# ADR-0206: Immutable posted financial facts and owner operational state

**Status:** Accepted by Conrad on 2026-09-23, resolving audit decision C-02.

The founder selected: “Separate operational records; keep posted rows immutable.”
This is an accepted target contract, not implementation or release evidence.

## Context

Phase 13 freezes the complete posted contribution header, designation lines and
postings. Its earlier schema sketch also placed payment/review status on the
header, and Phase 14 added acknowledgment state and hold time there. Those fields
must evolve after posting; the two physical instructions could not both hold.
The audit recorded the conflict rather than silently permitting financial-row
updates or selecting a storage layout without the owner ruling.

## Decision

Keep posted financial rows **fully immutable**, including columns added later.
Do not introduce an operational-field update allowlist, disable the protection,
or make an exception for privileged application, import or maintenance writes.
The qualified initial draft-to-posted commit remains the permitted one-time
transition. Its durable posting/freeze fact governs immutability: changing a
mutable operational status cannot make a posted row editable again.

Store mutable operational state in **separate records owned by the responsible
domain**, related through exact same-Tenant source identities:

- Phase 13 owns processor/offline payment observations and their qualified current
  state, finance review state and any operational reconciliation metadata. Posting,
  reversal and effective money remain derived from append-only postings and
  source evidence; an operational status does not create or reverse money.
- Phase 14 owns acknowledgment purpose, audience, readiness, hold and release
  state in separate request records and exact source relations. Preserve its
  existing consolidated-request cardinality; one request may cover the source-
  admitted set of contributions or settlements. Do not invent one request per
  header, a duplicate sender queue or a new acknowledgment policy. Initial DAF
  attribution capture remains frozen evidence; later qualified attribution and
  credit repair belongs to Phase 14 records and current projections, never a
  rewrite of the initial financial header.
- Phase 15 owns mutable deposit membership and operational return state in
  separate gift-grain records, with at most one current deposit per gift and
  append-only assignment history. Preserve settlement-rail, same-Tenant,
  currency/account and consumed-revision constraints. Deposit reassignment
  changes no money truth and cannot write a posted header; a return requiring
  money correction still follows the existing append-only source contract.
- Phase 7 receipt facts, Phase 18 document identity/current artifacts, Phase 19
  statement operations and Phase 6 communication outcomes remain with those
  owners. Joined reads may display them together; no mutable copy on the financial
  row or Phase 14 request becomes another owner's truth.

Expose coherent joined projections through the current source authorization and
version/cursor contracts. Missing, stale or unavailable owner state cannot be
reconstructed from an old header column or turned into a success/default. Use
exact expected revisions, source keys and permanent semantic operation identity.
A source-qualified known absence remains valid where its owner contract admits
it, such as no current deposit membership deriving undeposited for an eligible
cash or check gift. Preserve exact scope/version and completeness proof; a failed
lookup or missing required record cannot be treated as that known absence.
This does not require one operational row per source.
When a local accepted command changes several records, required state, receipt,
audit and outbox facts commit atomically under the existing owner transaction.
Provider I/O remains outside that transaction and uses the existing same-operation
recovery contract; this decision creates no distributed transaction promise.

Locking an immutable header to serialize allocation of the next append-only
posting sequence does not change it. A mutable sequence counter or cache on a
posted header is prohibited; keep such operational metadata in its owner record
or derive the next value under the qualified locking/uniqueness protocol.

## Consequences and required proof

The extra relations and joins preserve a strong financial-row invariant and
explicit domain ownership, at the cost of coherent-read, foreign-key and command
transaction work. Builders must qualify those seams; a view or UI-only split is
insufficient. Physical SQL names may follow existing repository conventions,
but the separate storage, exact identities and invariants are mandatory.

Prove that authorized operational transitions leave every posted financial
column byte-for-byte unchanged; ordinary and privileged UPDATE/DELETE attempts
fail; setting operational state to unposted cannot bypass the freeze; source
release, replay, rollback and concurrent correction preserve their exact facts;
and joined reads cannot combine contradictory source revisions or cross Tenants.
Retain the accepted multi-source acknowledgment, late evidence, cancellation and
uncertain-provider-outcome cases rather than simplifying them for the new storage.

Reconcile the actual target schema, migrations, grants, RLS, writers, readers,
constraints and tests before activation. This record does not create a runtime
table, approve a destructive migration, or satisfy that qualification. C-01's
staff-correction approval policy remains a separate unresolved decision.

## Related contracts

- [Phase 13 ledger and lifecycle](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md)
- [Phase 14 acknowledgment and credit ownership](../prds/sitestacker-parity/phase-14-donor-credit-operations.md)
- [Phase 15 deposit operations](../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md)
- [Audit decision record](../ai/audits/2026-09-23-contract-congruence.md#c-02-posted-state)
- [Active contribution-operations contract](../../openspec/changes/sitestacker-parity/specs/contribution-operations/spec.md)
