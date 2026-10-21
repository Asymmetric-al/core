# Delta for Contribution Operations

## ADDED Requirements

### Requirement: Every Staff-Entered Offline Gift Uses The Phase 15 Gateway

Every staff-entered offline gift MUST be staged, validated, reviewed as policy requires, and committed through Phase 15 `gift_entry_batches`.

Every clause in `openspec/contracts/contribution-operations.md#contract-c4e118881be86ac51ec4` MUST apply without exception.

#### Scenario: Staff records one check

- WHEN authorized staff uses quick entry for one check
- THEN the UI presents one concise gift form and one truthful confirmation
- AND the server creates and commits a one-row `gift_entry_batches` record
  through the same validation and posting path as a multi-row batch
- AND Phase 13 contains the resulting canonical contribution

#### Scenario: A surface attempts a direct offline write

- WHEN a Mission Control surface or automation tries to bypass the Phase 15
  commit service
- THEN the server rejects the write
- AND no contribution header, allocation, posting, official fact, artifact, or
  communication is created

### Requirement: Offline Rows Support Known And Intentionally Unknown Donors

Phase 15 MUST offer two explicit payer-identity modes for an offline row: `known` and `unknown_offline`.

Every clause in `openspec/contracts/contribution-operations.md#contract-9f7cc8619f882c96bfa4` MUST apply without exception.

#### Scenario: Staff records a known donor's anonymous check

- WHEN staff selects a same-tenant Party and marks the gift anonymous to
  missionary/public audiences
- THEN Phase 15 commits a Phase 13 contribution with the exact legal-donor
  Party and source evidence
- AND role-scoped projections hide the identity from missionary/public output
  while authorized finance retains it

#### Scenario: Staff records offering-box cash with no donor evidence

- WHEN staff intentionally selects `unknown_offline` and supplies the required
  money, dating, allocation, and batch evidence
- THEN Phase 15 can commit the row with no legal-donor Party or fabricated
  contact data
- AND the contribution remains explainable and reconcilable as intentionally
  unknown

#### Scenario: A known row references another tenant's Party

- WHEN a staged known row contains a Party outside the batch tenant
- THEN validation fails before commit
- AND no partial money, identity, official-document, or communication effect is
  written

### Requirement: Receipt Evaluation Remains Source-Owned

After a successful Phase 15 commit, the platform MUST emit the source occurrence needed for Phase 7 to evaluate official receipt eligibility and facts.

Every clause in `openspec/contracts/contribution-operations.md#contract-1ece7948235e5a82faf6` MUST apply without exception.

#### Scenario: Unknown cash is posted

- WHEN Phase 15 commits an `unknown_offline` row
- THEN Phase 7 records the exact not-receiptable evaluation reason
- AND Phase 18, Phase 17, and Phase 6 create no official receipt artifact or
  delivery unless a later eligible facts version authorizes them

#### Scenario: Staff later identifies the legal donor

- GIVEN an `unknown_offline` contribution later receives sufficient verified
  source evidence
- WHEN authorized staff completes the donor-identity correction with a reason
- THEN Phase 13 appends the correction and freezes the new evidence
- AND Phase 7 independently evaluates a successor facts version
- AND the original unknown state remains in the audit and correction lineage

### Requirement: Offline Entry Gives Clear And Recoverable Feedback

The known/unknown choice MUST be plain-language, accessible, and reversible while the row is still a draft.

Every clause in `openspec/contracts/contribution-operations.md#contract-a16d4d9d34b27cb9040e` MUST apply without exception.

#### Scenario: An unknown row is missing an allocation

- WHEN staff attempts to commit the row
- THEN validation identifies the missing allocation in context
- AND the draft remains editable without losing the supplied amount or date
- AND no partial contribution is posted

#### Scenario: A commit response is lost

- GIVEN Phase 15 committed the batch but the client did not receive the response
- WHEN the client retries with the same batch and row identities
- THEN the service returns the existing result
- AND it does not create a second Phase 13 contribution or downstream
  occurrence
