## Checkout ownership

React state carries the attempt ID separately from its request fingerprint. A
fingerprint may be reused for a retry and cannot identify the owner of a queued
result. Pure transitions derive from React's latest matching state; they neither
mutate refs nor apply to another attempt. A layout effect synchronizes committed
state and clears the matching active attempt after its terminal state commits.
Helper booleans acknowledge eligible scheduling, not a rendered confirmation.
Scrolling therefore follows rendered success instead of a helper return value.

The initial processing update shares one snapshot with its synchronous ref. An
in-flight guard rejects repeated clicks before React renders the disabled button.
The mounted-key layout effect is independent of state synchronization, so a key
change cannot overwrite a pending checkout result. Existing Stripe finality,
server-authoritative fee values, and idempotency key selection stay intact.

## Feed ownership

Initial published loading and reload share a monotonically increasing sequence.
Only the latest sequence may update posts, errors, loading, or notifications.
Unmount invalidates pending results. Retry clears the prior error while preserving
last-good posts. Draft and follower-request behavior keep their existing scope.

## Calendar dates

The contribution sheet passes its `YYYY-MM-DD` gift date directly to the existing
locale formatter. Constructing a Date first erases the formatter's date-only
classification and shifts UTC midnight to the previous calendar day in western
time zones. Audit timestamps continue using the existing timestamp formatter.

## Validation

Tests cover deferred transition application, same-fingerprint different owners,
newer snapshots of one owner, React replay, repeated confirmation before render,
initial/reload response inversion, retry error reset, unmount, and the actual
contribution sheet with UTC, Los Angeles, and Bangkok formatters. Existing checkout
provider-boundary tests retain the original request and success behavior. All
provider responses are local fixtures; no live financial operation is involved.
