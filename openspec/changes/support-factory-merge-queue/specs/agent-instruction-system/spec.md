# Spec Delta

## ADDED Requirements

### Requirement: VM Factory Merges Through A Required Merge Queue

When the target branch's active rules require a merge queue, the VM factory
SHALL request an authorized merge by adding the pull request to that queue at
its reviewed head, not by merging it directly. Queued SHALL NOT be reported as
merged. When no merge queue is required, the factory's direct protected merge
request SHALL stay exactly as it was.

#### Scenario: A queue is required and the pull request may merge

- **WHEN** readiness authorizes a merge and the target branch's active rules
  include a merge queue
- **THEN** the factory adds the pull request to the queue, bound to the reviewed
  head
- **AND** the issue is reported MERGED only after GitHub reports the pull
  request merged on the target branch

#### Scenario: GitHub rejects the enqueue

- **WHEN** GitHub refuses to add the pull request to the queue
- **THEN** the request is recorded as refused with GitHub's reason
- **AND** the issue is not reported MERGED

#### Scenario: The enqueue response is lost

- **WHEN** the enqueue's response is lost or GitHub answers with a server error
- **THEN** its outcome is unknown and is reconciled from GitHub before any retry

#### Scenario: No queue is required

- **WHEN** readiness authorizes a merge and the target branch requires no merge
  queue
- **THEN** the factory sends the same direct expected-head merge request it
  sends today

#### Scenario: The queue is configured where the factory cannot see it

- **WHEN** a merge queue is required by a classic branch protection rule, which
  GitHub's REST protection response does not report
- **THEN** the factory requests a direct merge, GitHub refuses it, and the issue
  blocks without being reported MERGED

### Requirement: VM Factory Readiness Accepts A Behind Branch Under A Merge Queue

When the target branch requires a merge queue, readiness SHALL NOT require the
pull request branch to be up to date with its base, because the queue tests
the change against the latest base before merging. A conflict with the base
SHALL still require integration. Without a queue, strict status checks SHALL
keep requiring an up-to-date branch.

#### Scenario: A behind branch under a queue

- **WHEN** the pull request is behind its base, a required check is strict, and
  the target branch requires a merge queue
- **THEN** readiness requests no base integration for staleness alone

#### Scenario: A conflicting branch under a queue

- **WHEN** the pull request conflicts with its base and the target branch
  requires a merge queue
- **THEN** readiness still requests a base integration

#### Scenario: A behind branch without a queue

- **WHEN** the pull request is behind its base, a required check is strict, and
  no merge queue is required
- **THEN** readiness requests a base integration as it does today
