## Why

PR #1865 can accept a successful payment result only in a ref while React keeps
showing processing. Published-feed requests can overwrite newer results, and
contribution gift dates can shift to the previous day in a visitor's time zone.
These defects remain on the published branch despite earlier review resolutions.

## What Changes

- Bind checkout transitions to the attempt ID carried by React state, including
  retries with the same request fingerprint.
- Keep state updaters pure; synchronize completion refs after React commits and
  observe the mounted Stripe key in a separate layout effect.
- Lock repeated confirmation synchronously until the active attempt completes.
- Accept only the latest published-feed result across initial loading and reload,
  clear the obsolete retry error, and ignore results after unmount.
- Preserve the contribution gift date as a calendar-day string for formatting.

## Capabilities

### New Capabilities

- `react-ui-consistency`: ownership of asynchronous UI state and calendar-date
  presentation.

### Modified Capabilities

None. Server payment authority, idempotency, gift values, and API contracts remain
unchanged.

## Impact

Donor checkout, missionary feed loading, the admin contribution sheet, and focused
regression tests. No schema, dependency, provider, tenant, or authorization changes.
Rollback reverts this UI repair; it never changes financial records or provider
transactions. Keep this change active until the implementation is integrated and
verified against the final base.
