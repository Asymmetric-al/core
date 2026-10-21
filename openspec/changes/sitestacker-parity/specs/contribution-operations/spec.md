## MODIFIED Requirements

### Requirement: Contribution Corrections Preserve Money And Identity Truth

Contribution operations MUST distinguish harmless internal metadata edits from corrections that affect money, donor identity, designation, provider state, refunds, official donor records, or donor-visible history.

Every clause in `openspec/contracts/contribution-operations.md#contract-0aee09c987fe3a675774` MUST apply without exception.

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

Phase 14 tribute notification coverage MUST use the canonical actual recipient Party and contribution header within one Tenant as its identity.

Every clause in `openspec/contracts/contribution-operations.md#contract-0522e0b7a8df62b436a0` MUST apply without exception.

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

The system MUST keep the complete posted contribution header, designation lines and postings immutable, including subsequently added columns.

Every clause in `openspec/contracts/contribution-operations.md#contract-d6b571035769419c0620` MUST apply without exception.

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
