# Resend Email Integration

Multi-tenant email sending through Resend. Each tenant connects its own Resend
API key and verified sending domain.

## Quick Start

### 1) Create a Resend API key

1. Open [Resend API Keys](https://resend.com/api-keys)
2. Create a key with at least **sending access**
3. Copy the key (starts with `re_`)

### 2) Verify a domain in Resend

1. Open [Resend Domains](https://resend.com/domains)
2. Add your domain
3. Complete DNS verification
4. Use a `from` address on that verified domain

### 3) Connect from Admin

1. Go to `Settings -> Integrations -> Resend`
2. Enter API key, default from email, and sender name
3. Save connection and run **Send Test Email**

## Package Surface

The shared email package lives in `packages/email` and exports:

- `validateResendApiKey()`
- `sendEmail()`
- `sendTestEmail()`
- `createResendClient()`
- `RESEND_ERROR_CODES`

## API Endpoints

The admin integration UI now uses:

- `GET /api/email/connect` (hydrate persisted tenant state)
- `POST /api/email/connect`
- `DELETE /api/email/connect`
- `POST /api/email/test-send`
- `POST /api/email/webhooks/resend`

`POST /api/email/connect` validates the API key with Resend and persists tenant
settings in `tenant_email_settings`. API keys are stored encrypted.

The connect flow now fails fast when `defaultFromEmail` does not use one of the
account's exact verified Resend domains or subdomains. This prevents a
"connected but unsendable" state where the first failure would otherwise happen
later during `POST /api/email/test-send` or production delivery.

Successful connects also persist a sanitized validation snapshot
(`senderIdentities`, `domainAuthentication`, warnings, score, and derived
deliverability booleans). `GET /api/email/connect` now hydrates directly from
that stored snapshot instead of revalidating against Resend on every page load.
Legacy connected rows without a snapshot are treated conservatively:
`connected = true`, `sendReady = false`, and the admin UI asks the tenant to
reconnect once to refresh sender/domain metadata.

Deploy note: apply
`supabase/migrations/20260402100000_resend_validation_snapshot.sql` before, or
in the same rollout as, any app version that reads or writes
`tenant_email_settings.validation_snapshot`.

When a tenant disconnects Resend, the stored default sender fields remain
available so the admin form can preserve the last known `from` address, sender
name, and reply-to email for the next reconnect flow.

`POST /api/email/test-send` can use either the explicit key sent by the client
or the tenant's stored encrypted key. It also re-checks that the chosen sender
address still matches a verified domain before attempting the provider send. If
delivery succeeds but `email_send_logs` cannot be written, the route now returns
success with an explicit audit warning instead of silently dropping the audit
trail.

`POST /api/email/webhooks/resend` verifies Svix signatures before branching by
event type and persisting event/suppression/inbound metadata.

## Where to Change What

Use this map when extending behavior:

- Sending API/client surface:
  - `packages/email/resend.ts`
  - `packages/email/types.ts`
  - `packages/email/constants.ts`
- Tenant integration state + key management:
  - `packages/api/src/email/connect.ts`
  - `packages/api/src/email/settings-store.ts`
  - `packages/api/src/email/crypto.ts`
- Webhook ingestion and tenant resolution:
  - `packages/api/src/email/webhooks/resend.ts`
- Inbound retrieval and attachment handling:
  - `packages/api/src/email/webhooks/resend.ts`
  - `packages/email/resend.ts`
- Admin integration routes/UI wiring:
  - `apps/admin/app/api/email/connect/route.ts`
  - `apps/admin/app/api/email/test-send/route.ts`
  - `apps/admin/app/api/email/webhooks/resend/route.ts`
  - `apps/admin/app/settings/integrations/resend/page.tsx`
- Persistence/schema/types:
  - `supabase/schema.sql`
  - `supabase/migrations/20260223120000_resend_email_foundation.sql`
  - `supabase/migrations/20260402100000_resend_validation_snapshot.sql`
  - `supabase/migrations/20260426100000_resend_email_rls_grants.sql`
  - `packages/database/types/database.ts`
- Regression tests:
  - `tests/unit/packages/api/email/webhooks-resend.test.ts`
  - `tests/unit/packages/api/email/connect.test.ts`
  - `tests/unit/packages/api/email/test-send.test.ts`

## Environment Variables

Use these variables when wiring server-side defaults/webhooks:

- `RESEND_API_KEY` (required for webhook signature verification and inbound body retrieval)
- `RESEND_WEBHOOK_SECRET` (required for webhook signature verification)
- `RESEND_ENCRYPTION_KEY` (required to encrypt/decrypt tenant API keys at rest)

All three variables are server-only and are validated by `packages/env` for
staging and production deployments:

- `RESEND_API_KEY` must start with `re_`.
- `RESEND_WEBHOOK_SECRET` must start with `whsec_`.
- `RESEND_ENCRYPTION_KEY` must be at least 32 characters. Rotating it requires
  re-encrypting existing tenant API keys; see the rotation runbook below.

Do not expose these as `NEXT_PUBLIC_*` variables or log their values.

## Sending Contract

All production Resend sends must include a stable idempotency key. Use a
deterministic `<event-type>/<entity-id>` key for single sends and a
`batch-<event-type>/<batch-id>` key for future batch sends. Resend idempotency
keys expire after 24 hours and must be 256 characters or fewer.

Single email requests are capped at 50 recipients. Future campaign and bulk
delivery work must use explicit chunking/batching before calling Resend; batch
sends are limited to 100 email objects and do not support attachments or
scheduling.

## Error Codes

Common result codes from the email package:

- `invalid_api_key`
- `unauthorized`
- `forbidden`
- `rate_limited`
- `conflict`
- `validation_error`
- `sender_not_verified`
- `webhook_signature_invalid`
- `server_error`

## Persistence Foundation

The Resend hardening pass adds foundational tables for analytics/compliance:

- `tenant_email_settings`
- `email_send_logs`
- `email_events`
- `email_suppression_groups`
- `email_suppressions`
- `email_inbound_messages`

These tables are server-only. RLS is enabled, `anon` and `authenticated` grants
are revoked, and the service role is granted table access. Application code must
continue to access these tables only through server-side `@asym/api` handlers
using the Supabase admin client.

## Webhook Tenant Resolution Behavior

`POST /api/email/webhooks/resend` uses deterministic tenant resolution with hybrid
strictness:

- Outbound events (`email.delivered`, `email.bounced`, etc.) must resolve a
  tenant from payload (`tenant_id`) or `email_send_logs` lookup by
  `resend_message_id`. If unresolved, the endpoint returns `422`.
- Dependency failures such as unavailable Supabase admin access or failed lookup
  queries return `503` so Resend can retry rather than treating the event as a
  permanent bad payload.
- Inbound events (`email.received`) can resolve from payload or connected sender
  domains. If unresolved/ambiguous, the endpoint returns `202` with
  `tenantWarningCode` and `tenantWarning`, and still stores inbound metadata.
- Core persistence failures return `503` with `webhook_persistence_failed`.

## Key Rotation Runbooks

### Rotate `RESEND_API_KEY`

Use this when rotating the server-level key used by webhook verification and
inbound retrieval.

1. Create a new API key in Resend.
2. Update `RESEND_API_KEY` in your deployment environment.
3. Deploy and verify:
   - `POST /api/email/webhooks/resend` accepts signed events.
   - `email.received` events still load body/attachments.
4. After verification, revoke the old key in Resend.

Rollback: restore previous `RESEND_API_KEY` and redeploy.

### Rotate `RESEND_WEBHOOK_SECRET`

Use this when rotating the webhook signing secret in Resend.

1. Generate a new webhook secret in Resend for the same endpoint.
2. Update `RESEND_WEBHOOK_SECRET` in your deployment environment.
3. Deploy quickly so secret values match on both sides.
4. Verify webhook delivery with a test event (expect `200`/`202`, not `401`).

Rollback: revert `RESEND_WEBHOOK_SECRET` and redeploy, then reset the webhook
secret in Resend if needed.

### Rotate `RESEND_ENCRYPTION_KEY` (Critical)

`RESEND_ENCRYPTION_KEY` protects `tenant_email_settings.resend_api_key_encrypted`.
Rotating it without migration will make existing tenant keys unreadable.

1. Export all connected tenant rows from `tenant_email_settings`.
2. Decrypt each stored key using the current `RESEND_ENCRYPTION_KEY`.
3. Re-encrypt each key using the new `RESEND_ENCRYPTION_KEY`.
4. Update encrypted values atomically (maintenance window recommended).
5. Deploy with the new `RESEND_ENCRYPTION_KEY`.
6. Verify tenants can still hydrate integration state and send test email.

Rollback: restore prior encrypted values and prior `RESEND_ENCRYPTION_KEY`.

## Webhook Replay Handling

Webhook replay is supported and intended to be idempotent for core ingestion
tables:

- `email_events`: upsert on `(tenant_id, resend_event_id)`.
- `email_suppressions`: upsert on `(tenant_id, email, suppression_type)`.
- `email_inbound_messages`: upsert on `resend_email_id`.

Operational caveat:

- If provider `resend_event_id` is missing, ingestion derives a deterministic
  synthetic event id and still upserts. This is replay-safe for identical
  payloads.
- If upstream retries mutate payload fields between deliveries, synthetic ids can
  differ and create separate event rows (treat as distinct event snapshots).

## Known Current Limits

- Outbound events without resolvable tenant context still fail closed with `422`.
- Inbound events with unresolved/ambiguous tenant resolve to `202` and store
  metadata with `tenant_id = null`.
- Inbound body and attachment retrieval are independent; one can fail while the
  other succeeds. Response flags (`receivedEmailLoaded`, `attachmentsLoaded`)
  indicate what was loaded.
- Live Resend webhook creation and DNS changes are operational tasks. The CLI
  can confirm current state, but creating webhooks and fixing MX records require
  a public endpoint, DNS-provider access, and explicit approval because they
  mutate live provider configuration.

## Observability And Retention

Every send response includes a `correlationId`, `recipientCount`, and
`retryCount`; provider message ids are persisted when available. Webhook
processing logs structured failures for tenant resolution, core persistence, and
unexpected processing errors without logging API keys or webhook secrets.

Retention policy:

- Keep `email_send_logs` and `email_events` for 400 days by default so donor
  receipt, annual statement, and deliverability investigations can cover the
  prior giving year.
- Keep `email_inbound_messages.parsed_text` and `parsed_html` for 90 days by
  default, then archive or purge parsed content while preserving event metadata
  needed for audit.
- Suppression records are operational safety records and should be retained
  until explicitly removed by an authorized staff/admin workflow.
- Any UI that later displays inbound HTML must sanitize it before rendering.

## Next Implementation Steps

- Add admin reporting views over `email_events`, `email_suppressions`, and
  `email_inbound_messages` for operational support.
- Add scheduled cleanup/archival jobs that enforce the retention policy above.

Replay verification examples:

```sql
-- Expect zero duplicate rows when resend_event_id is present
select tenant_id, resend_event_id, count(*)
from public.email_events
where resend_event_id is not null
group by tenant_id, resend_event_id
having count(*) > 1;
```

```sql
-- Confirm a specific inbound message is still single-row idempotent
select resend_email_id, count(*)
from public.email_inbound_messages
where resend_email_id = '<email_id>'
group by resend_email_id;
```

## Notes

- Keep API keys server-side only.
- Use verified domains in production for deliverability.
- Do not expose tenant API keys in client logs or analytics.
