## Why

Factory commissioning reproduced valid donor sign-in followed by No access when the CMS service credential is configured. The server auth context switches to an administrative profile reader and reads an unexposed membership schema, making identity resolution depend on unrelated administrative privileges.

## What Changes

- Resolve the current profile and active tenant memberships using the validated request-scoped client and the existing caller-only membership RPC.
- Deny unresolved profile or membership reads; preserve supported profile roles and staff subroles when resolution succeeds.
- Add regression evidence for cookie and bearer requests, CMS credential presence, and tenant boundaries.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `identity-and-access`: specify that current-user resolution is independent of administrative credentials and fails closed on unavailable authorization data.

## Impact

Shared `packages/auth/context.ts` and its tests; all consumers retain the same interface. No schema, grants, session transport, production configuration, billing or deployment changes. Issue: AL-1559 (#1559). Revert the isolated code change to roll back; no data migration is required.
