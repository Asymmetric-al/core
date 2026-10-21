## Why

Core needs a small managed Stripe sandbox copy in its existing development
Supabase project before any later application use. Operators need to verify
ingestion and privacy without making copied provider state business truth.

## What Changes

- Prepare the native managed Data Pipeline connection and a non-secret source record.
- Add a bounded read-only verifier and an operations runbook for setup, evidence,
  additional independent sources, costs, and connection-specific disconnection.
- Keep provider tables private and provider-managed, with no application consumers,
  migrations, generated types, payment effects, or required runtime configuration.

## Capabilities

### New Capabilities

- `managed-stripe-data-pipeline`: private sandbox ingestion and honest operational verification.

### Modified Capabilities

None. Existing donation, Connect, account-binding, and accounting contracts remain unchanged.

## Impact

Only operational documentation, one opt-in verification helper, focused tests,
and this change packet. The target is development project `pnmlrbgjiqzzsthsoikm`.
Rollback stops only the recorded provider connection; schema deletion is not the default.
