## ADDED Requirements

### Requirement: Checkout transitions retain exact attempt ownership

An asynchronous checkout transition MUST affect only React state owned by its
payment attempt. Request-fingerprint equality alone MUST NOT authorize another
attempt's result. React updaters MUST remain free of ref mutations. Completion
refs MUST reflect committed state, and a rejected queued transition MUST NOT
clear a newer active attempt. The mounted Stripe key MUST be observed at layout
commit independently of the checkout-state mirror.

#### Scenario: An older attempt and a retry share a fingerprint

- **WHEN** an older result applies after a newer same-fingerprint attempt owns React state
- **THEN** the older success, error, or stale transition is rejected
- **AND** the newer active attempt and rendered state remain intact

#### Scenario: React has a newer snapshot for the same attempt

- **WHEN** the matching attempt completes against an updated owned snapshot
- **THEN** the transition preserves unrelated fields from React's snapshot
- **AND** refs reflect the resulting state only after it commits

#### Scenario: React replays a queued transition

- **WHEN** React evaluates a transition more than once from the same previous state
- **THEN** each evaluation yields the same state without ref side effects

#### Scenario: Confirmation repeats before the pending render

- **WHEN** another confirmation occurs while the first attempt is active
- **THEN** the existing attempt remains the sole owner and no second donation request starts
- **AND** a completed retryable attempt can be retried using the existing idempotency contract

### Requirement: Published feed updates belong to the latest request

Only the latest published-feed request SHALL update posts, error state, loading
state, or failure notification. This applies across initial loading and reload.
Retry MUST clear the previous error and preserve last-good posts until a new
successful result arrives. Unmount MUST invalidate pending request results.

#### Scenario: An older published request finishes last

- **WHEN** a newer published request has started before an older request resolves
- **THEN** the older response changes no posts, error, loading, or notification state

#### Scenario: A failed feed is retried

- **WHEN** retry starts with an existing error and last-good posts
- **THEN** the old error clears and loading represents the latest request
- **AND** last-good posts remain available until a successful response replaces them

#### Scenario: The feed unmounts during reload

- **WHEN** a pending reload finishes after the feed unmounts
- **THEN** its result does not update the feed or emit a failure notification

### Requirement: Contribution gift dates preserve their calendar day

The contribution detail UI MUST preserve the canonical gift calendar day across
visitor time zones. Calendar dates MUST remain distinguishable from timestamped
events when passed to the shared locale formatter.

#### Scenario: A staff member views a gift in a western time zone

- **WHEN** a contribution with gift date `2026-07-01` is viewed in America/Los_Angeles
- **THEN** the gift date remains July 1 after hydration
- **AND** event timestamps continue to use their existing locale and time-zone behavior
