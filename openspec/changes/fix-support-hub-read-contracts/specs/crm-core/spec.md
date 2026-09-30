## ADDED Requirements

### Requirement: Support Hub Collections Preserve Database Valid Read Contracts

Support Hub route-backed collections MUST accept persisted agent, nested
assignee and inbox email values permitted by the owning SQL CHECK. They MUST
preserve tenant-scoped adapter values without inventing email normalization.
Malformed rows MUST NOT discard valid neighboring records; rejection diagnostics
MUST identify available row IDs and the rejected count without logging raw rows.

#### Scenario: An assigned conversation uses an internal agent address

- GIVEN the database permits an agent address such as a@b
- WHEN the current adapter output is read through the live API reader and collection reader
- THEN both retain the assigned conversation and its stored address

#### Scenario: A mailbox uses a database-valid internal address

- GIVEN the inbox addresses satisfy the existing SQL CHECK
- WHEN the inbox collection is fetched
- THEN the stored inbox and nullable reply-to value remain readable

#### Scenario: A response contains malformed and valid records

- GIVEN two response rows fail validation and another row is valid
- WHEN the collection reads the response
- THEN it retains the valid row and reports the rejected count and available row IDs

### Requirement: Retired CRM Runtime Scanning Keeps Output Exceptions Scoped

The retired Twenty runtime guard MUST limit Eve output exceptions to the owning
Eve directories. A directory with the same output name in another runtime source
location MUST remain subject to the guard.

#### Scenario: Non-Eve source is placed under an output-named directory

- GIVEN a non-Eve .output or .nitro directory contains a retired runtime marker
- WHEN runtime source verification walks the repository
- THEN it reports the marker while preserving the exact Eve generated-output exclusions
