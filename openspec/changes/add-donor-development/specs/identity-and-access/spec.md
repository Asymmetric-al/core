# Phase 27 scoped owner amendments

## ADDED Requirements

### Requirement: Phase 27 bounded source actions preserve current authority

P12 SHALL register exact Request preparation/submission/review decision/requirement administration/exception/reviewer reassignment/correction/presentation, P15 report/read/correct/routing and P9 shared create/read/history/correct/restrict capabilities.

Every clause in `openspec/contracts/identity-and-access.md#contract-ea962786dbc04401b437` MUST apply without exception.

#### Scenario: Revocation during recovery

- **GIVEN** a source operation committed before the requester lost visibility.
- **WHEN** the requester recovers the result.
- **THEN** lawful source success is retained but current disclosure denies protected content.

#### Scenario: Reporter is not finance

- **GIVEN** a permitted reporter records actual gift receipt with incomplete financial facts.
- **WHEN** the same actor requests financial posting or full finance detail.
- **THEN** report permission does not authorize either action and no invented financial root is created.

#### Scenario: Conditional review authority

- **GIVEN** a staff editor can prepare a Request but cannot waive required review.
- **WHEN** the editor changes terms or attempts presentation.
- **THEN** the exact source requirement and revision are rechecked and no approval is inferred from edit permission.
