# Document authority delta

## ADDED Requirements

### Requirement: Documentation Authority Preserves Owner Decisions And Provenance

The repository SHALL resolve product intent through explicit ratified domain-owner
decisions and scoped supersession, reconciling durable OpenSpec and active changes
with their governing sources. File dates, path category and phase numbers MUST
NOT silently transfer authority. Current behavior MUST be supported by source,
tests and relevant runtime evidence rather than planning publication.

#### Scenario: A later owner ruling conflicts with an old durable clause

- WHEN the accepted owner ruling explicitly supersedes a clause
- THEN the documentation is reconciled to that ruling with scope and provenance
- AND historical evidence remains identifiable without authorizing retired behavior
- AND an unresolved new tradeoff is returned for a decision instead of guessed

#### Scenario: A package uses generated OpenSpec story views

- WHEN an authorized story amendment affects a generated projection
- THEN the maintainer edits the declared canonical source and regenerates its views
- AND stable identifiers and full acceptance detail remain aligned
- AND original capture hashes remain dated provenance rather than runtime proof

#### Scenario: Multiple ratified phase packages are consolidated

- WHEN sibling phase PRs amend shared indexes or owner contracts
- THEN their scoped accepted amendments are reconciled cumulatively
- AND ratified, published, integrated, merged, implemented, qualified and activated
  states remain distinct
- AND no feature task is marked implemented merely because documents are integrated

#### Scenario: An active delta is verified

- WHEN repository documentation verification evaluates an active change
- THEN it checks structural validity and applicability to current durable requirement identities
- AND changed ADDED collisions and missing MODIFIED targets fail before synchronization
- AND archive criteria cover every contained implementation delta

#### Scenario: A current document contains superseded requirements

- WHEN an accepted later ruling changes a current PRD, ADR decision or acceptance clause
- THEN the maintainer rewrites that normative clause to the current owner contract
- AND a supersession banner or navigation pointer is not the only correction
- AND retained older wording is explicitly dated history with its source reference
- AND governing sources and declared projections are updated together
