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
select the pending C-02 physical carrier of contribution operational state or
claim that the target runtime has shipped.

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
