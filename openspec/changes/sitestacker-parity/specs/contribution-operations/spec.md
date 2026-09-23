## MODIFIED Requirements

### Requirement: Contribution Corrections Preserve Money And Identity Truth

Contribution operations MUST distinguish harmless internal metadata edits from
corrections that affect money, donor identity, designation, provider state,
refunds, official donor records, or donor-visible history.

Harmless internal metadata MAY update directly only through its qualified
source-owned record when it does not change money, identity, designation,
official donor records, provider state, or donor-visible history. For a posted
contribution, the edit MUST target a separate owner-controlled operational
record with exact same-Tenant source identity and current authorization. It
MUST NOT UPDATE or DELETE the posted financial header, designation lines or
postings, including operational-looking or subsequently added columns.

In-place edits to draft or never-posted source records MAY occur only when the
owning source contract authorizes that exact edit. A mutable operational state
change MUST NOT turn previously posted financial facts back into an editable
draft. The durable posting/freeze fact and ADR-0206 remain binding.

Corrections MUST be recorded for donor relinking, amount correction,
fund/designation correction, missionary or project allocation correction,
refund correction, receipt or statement correction, payment state correction,
Stripe replay, and other provider-state corrections.

#### Scenario: Staff changes harmless metadata

- GIVEN a staff user edits safe internal notes or tags for a posted contribution
- WHEN the edit does not affect money, identity, designation, official donor
  records, provider state, or donor-visible history
- THEN the platform applies the authorized edit to the qualified separate
  owner-controlled operational record under its exact same-Tenant source identity
- AND every posted financial header, designation line and posting stays unchanged
- AND the change is still auditable as a meaningful staff action when required

#### Scenario: Staff changes donor identity on a gift

- GIVEN a staff user relinks a gift to a different donor
- WHEN the operation is confirmed
- THEN the platform records a correction
- AND the original gift remains explainable through before/after summary
- AND donor-visible history updates from the same corrected truth

#### Scenario: Staff changes a gift amount or designation

- GIVEN a staff user corrects amount, fund, designation, missionary, or project
  allocation
- WHEN the correction is confirmed
- THEN the platform records a correction rather than silently overwriting money
  or allocation truth
- AND related donor-visible and staff-visible read models derive from the same
  corrected contribution truth

#### Scenario: Source-authorized metadata editing before posting

- GIVEN a draft or never-posted source record and a staff metadata edit
- WHEN the source owner authorizes that exact edit and current actor/source scope
- THEN the platform may apply the harmless edit in place under that owner contract
- AND money, identity, designation, official-record, provider-state or donor-visible
  corrections still require the correction contract
- AND the edit remains auditable when required

#### Scenario: An operational reset cannot authorize a posted metadata update

- GIVEN a contribution whose durable posting/freeze fact already exists
- WHEN an ordinary or privileged caller changes operational state to unposted
  or attempts a harmless-metadata UPDATE on a posted financial row
- THEN the financial row remains immutable
- AND an authorized metadata edit can affect only its qualified separate owner record

## ADDED Requirements

### Requirement: Tribute Coverage Uses Canonical Recipient Identity

Phase 14 tribute notification coverage MUST use the canonical actual recipient
Party and contribution header within one Tenant as its identity. The target
coverage key is `(tenant_id, recipient_party_id, header_id)`. The separate
`notify_party_id` MUST retain the exact tribute stream-preference provenance;
it MUST NOT substitute for recipient identity. The letter's independent
`(tenant_id, tribute_id, notify_party_id, period_key)` anchor MUST remain intact.

The source MUST atomically claim coverage with its purpose letter and durable
outbox request. Matching same-Tenant composite relationships MUST bind the
actual recipient, authorized preference row, letter and contribution header,
even for privileged writes. An authorized per-gift recipient override MUST
resolve the actual recipient and coherent authorized stream/letter provenance
before the coverage claim; neither a mismatched identity nor the override
itself grants authority. Tombstone/re-add, Party/tribute merge and an
honor-to-memorial successor MUST preserve earlier recipient/header claims,
original presentation history and applicable strictest suppression. A new
stream MUST NOT silently reset coverage or inherit gift links automatically.

Only an authorized prepared/held purpose proved not released MAY cancel and
reopen coverage in one expected-state/revision transaction that races source
release. Released, submitted or uncertain work MUST follow exact source and
Phase 6 receipt-backed recovery; cancel UI, timeout or retry MUST NOT reset
already-released coverage or fabricate recall/retraction. Source purpose,
Phase 6 communication outcomes and Phase 18 artifact authority remain separate.

This planned contract projects the accepted Phase 14 D3.1/D3.11, F.1/F.6/F.12,
data-model and ownership-matrix outcomes in
`docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`. It does not
claim that the target runtime has shipped. The separate accepted C-02
requirement below and ADR-0206 govern physical operational-state placement;
this tribute contract retains its source, coverage and cancellation semantics.

#### Scenario: Different tribute preferences share one recipient claim

- GIVEN two distinct tribute preference rows for the same canonical recipient
  Party and one contribution header within a Tenant
- WHEN both streams concurrently attempt to compose that gift
- THEN either commit order yields one recipient/header coverage occurrence
- AND each stream retains its own exact period anchor and provenance
- AND retry cannot create a duplicate letter for the covered gift

#### Scenario: Identity maintenance preserves coverage and suppression

- GIVEN a recipient/header claim with frozen presentation history
- WHEN a watcher is tombstoned and re-added, an owner-qualified Party or tribute
  merge occurs, or an honor stream gains a memorial successor
- THEN prior coverage, original history and applicable strictest suppression
  remain effective
- AND a new preference row or deliberately relinked gift cannot authorize a
  duplicate notification
- AND a successor does not automatically inherit gift links

#### Scenario: Recipient override requires exact authorized provenance

- GIVEN an admitted per-gift recipient override
- WHEN composition resolves the actual recipient and claims coverage
- THEN the key uses that canonical recipient Party
- AND matching same-Tenant constraints prove the authorized stream and letter
- AND forged Party/stream/letter combinations fail even under privileged writes

#### Scenario: Cancellation races source release

- GIVEN an authorized prepared or held request proved not released
- WHEN cancellation and release race under the same expected-state guard
- THEN exactly one transition wins durably
- AND only a winning pre-release cancellation reopens its items atomically
- AND exact replay preserves the accepted result without duplicate coverage

#### Scenario: Unknown delivery outcome cannot reopen released coverage

- GIVEN a released or submitted request whose downstream outcome is uncertain
- WHEN staff click cancel or retry after losing a response
- THEN coverage remains claimed pending exact owner recovery
- AND no automatic retraction, fabricated recall or duplicate composition occurs

### Requirement: Posted Financial Facts Have Separate Owner Operational State

The system MUST keep the complete posted contribution header, designation lines
and postings immutable, including subsequently added columns. Following the
accepted founder ruling in ADR-0206, mutable payment/review and acknowledgment
operational state MUST use separate domain-owned records with exact same-Tenant
source references, exposed through coherent authorized joined projections.
No operational-field allowlist or privileged path MAY update a posted financial
row. The durable posting/freeze fact MUST govern this protection; changing an
operational status MUST NOT reopen the row for editing.

Phase 13 MUST retain payment source evidence, finance review and operational
reconciliation ownership. Posting/reversal and effective money MUST remain
append-only-derived. Phase 14 MUST retain separate acknowledgment purpose/request
state and exact admitted contribution/settlement relations, including existing
consolidated-request cardinality. Phase 7 facts, Phase 18 artifacts, Phase 19
statement operations and Phase 6 communication outcomes MUST retain their
independent owners rather than becoming mutable header/request copies.
Phase 14 current attribution repair MUST preserve frozen initial header capture.
Phase 15 deposit membership and operational return state MUST use separate
gift-grain owner records with at most one current deposit per gift and append-only
assignment history. Same-Tenant, settlement-rail, currency/account and exact
consumed-revision constraints MUST remain binding; deposit reassignment MUST NOT
rewrite posted headers or create money. Financial return corrections MUST retain
the existing append-only source contract.

Local accepted state, source result, required audit and outbox facts MUST commit
atomically under the qualified owner command, with expected revisions and
permanent semantic identity. Provider I/O and uncertainty MUST use the existing
source recovery contract. Locking the immutable header for sequence allocation
MAY serialize append-only postings; it MUST NOT update a header counter.
Joined readers MUST preserve exact current authority and coherent source
versions/cursors and MUST NOT substitute stale legacy state for unavailable facts.
A source-qualified known absence MUST remain a valid result where the owner
contract admits it, with exact scope/version and completeness proof. A failed
lookup, unavailable evidence or missing required record MUST NOT default to
that known absence or success. This sets no mandatory row-per-source cardinality.
This architecture ruling does not settle C-01's staff-correction approval policy
or prove that the schema and runtime have been implemented.

#### Scenario: Operational transitions preserve all posted financial columns

- GIVEN a posted contribution and its separate owner operational records
- WHEN current qualified payment, review, acknowledgment, attribution or deposit state changes
- THEN only the owning operational records and required source evidence change
- AND every posted financial column remains unchanged
- AND joined reads expose each result under its exact source identity/version

#### Scenario: A mutable state cannot reopen a frozen row

- GIVEN a durably posted contribution
- WHEN an ordinary or privileged path changes operational state to unposted or
  attempts UPDATE or DELETE on its financial header, lines or postings
- THEN financial-row mutation remains forbidden by the durable freeze fact
- AND no trigger bypass or operational-field update exception is accepted

#### Scenario: Multi-source acknowledgment preserves its existing cardinality

- GIVEN a Phase 14 request covering an owner-admitted consolidated source set
- WHEN its purpose, hold, readiness or release state changes
- THEN its separate request and exact same-Tenant source relations retain that set
- AND no single-header assumption splits or duplicates the intended request
- AND Phase 6 delivery and Phase 18 artifact outcomes remain separate facts

#### Scenario: Concurrent source work preserves one atomic result

- GIVEN exact source revisions and one semantic command identity
- WHEN release, correction, replay or recovery races a local operational update
- THEN the qualified owner transaction accepts one consistent result with its
  required receipt, audit and outbox or leaves no partial accepted state
- AND unknown provider outcome reconciles the existing operation without
  inventing or duplicating a financial fact, a semantic operation or a communication
- AND recovery may record the one exact owner-admitted, source-confirmed effect
  if it has not already been recorded

#### Scenario: Posting sequence allocation does not rewrite the header

- GIVEN a posted immutable header with append-only posting history
- WHEN concurrent corrections allocate the next sequence under the owner lock
- THEN unique monotonic sequences serialize the accepted appended entries
- AND no mutable counter or cache is written onto the posted header

#### Scenario: Joined state cannot substitute an unqualified legacy value

- GIVEN a joined read whose required owner state is missing, stale or unavailable
- WHEN the authorized contribution view is requested
- THEN it returns the source-qualified incomplete/unavailable result
- AND it does not mix revisions, cross Tenant boundaries, claim success or fall
  back to a legacy mutable financial-row status
