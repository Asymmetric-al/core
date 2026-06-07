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
- `GET /api/email/templates`
- `POST /api/email/templates`
- `POST /api/email/templates/test-send`
- `POST /api/email/templates/[templateId]/test-send`
- `POST /api/email/assets/upload`
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

## Email Studio Template Sends

Email Studio stores templates in Asym tables and sends exported HTML/text through
the existing Resend service layer. React Email Editor is the editor runtime, but
it does not own delivery. The production path is:

```txt
email_templates/email_template_versions
  -> merge-tag validation and substitution
  -> sendEmail(...) in packages/email/resend.ts
  -> email_send_logs
  -> Resend webhook events
```

`POST /api/email/test-send` remains the generic Resend connection test.
Template-specific testing uses `POST /api/email/templates/test-send` for current
draft editor output or `POST /api/email/templates/[templateId]/test-send` for a
stored template. These routes send the actual edited HTML/text, write
`email_send_logs.metadata.source = "email_studio_template_test_send"`, and never
expose decrypted API keys to the client.

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
- Email Studio templates:
  - `packages/api/src/email/templates.ts`
  - `packages/api/src/email/template-store.ts`
  - `packages/api/src/email/template-test-send.ts`
  - `packages/api/src/email/assets.ts`
- Webhook ingestion and tenant resolution:
  - `packages/api/src/email/webhooks/resend.ts`
- Inbound retrieval and attachment handling:
  - `packages/api/src/email/webhooks/resend.ts`
  - `packages/email/resend.ts`
- Admin integration routes/UI wiring:
  - `apps/admin/app/api/email/connect/route.ts`
  - `apps/admin/app/api/email/test-send/route.ts`
  - `apps/admin/app/api/email/templates/**/route.ts`
  - `apps/admin/app/api/email/assets/upload/route.ts`
  - `apps/admin/app/api/email/webhooks/resend/route.ts`
  - `apps/admin/app/settings/integrations/resend/page.tsx`
- Persistence/schema/types:
  - `supabase/schema.sql`
  - `supabase/migrations/20260402090000_resend_email_foundation_backfill.sql`
  - `supabase/migrations/20260402100000_resend_validation_snapshot.sql`
  - `supabase/migrations/20260426100000_resend_email_rls_grants.sql`
  - `supabase/migrations/20260511023547_email_studio_react_email_builder.sql`
  - `supabase/migrations/20260511024000_email_assets_storage_bucket.sql`
  - `packages/database/types/database.ts`
- Regression tests:
  - `tests/unit/packages/api/email/webhooks-resend.test.ts`
  - `tests/unit/packages/api/email/connect.test.ts`
  - `tests/unit/packages/api/email/test-send.test.ts`
  - `tests/unit/packages/api/email/templates.test.ts`
  - `tests/unit/packages/api/email/template-test-send.test.ts`
  - `tests/unit/packages/api/email/assets.test.ts`

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
  domains. If unresolved or ambiguous, the endpoint returns `503` so Resend
  retries after the tenant/domain configuration issue is fixed. The webhook does
  not store inbound metadata without a tenant assignment.
- Core persistence failures return `503` with `webhook_persistence_failed` and a
  correlation id. Detailed database context is logged server-side only.

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

1. Run the guarded `Configure Resend Production Webhook` workflow in dry-run mode.
2. Run the same workflow in write mode to create or update the production endpoint,
   mask the returned `whsec_...`, and sync `RESEND_WEBHOOK_SECRET` into Vercel
   Production for `admin`, `donor`, and `missionary`.
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
- Inbound events with unresolved/ambiguous tenant resolution fail retryably with
  `503`; this is the planned tenant-safe behavior for the first Inngest email
  workflow slice as well. Do not guess a tenant, create a fake tenant, route to
  Support Hub, or dispatch tenant workflow work until exactly one tenant is
  known.
- Inbound events that are verified, tenant-safe, and durably stored should still
  return `200 OK` if immediate Inngest dispatch fails. The product-owned
  dispatch recovery path retries the workflow handoff instead of making Resend
  replay a webhook that was already accepted.
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
- For the first Inngest email workflow slice, move only the `email.received`
  body/attachment retrieval and Support Hub routing path behind durable workflow
  steps. Keep outbound delivery status, suppression, bounce, complaint, and
  send-log handling on the current path until separately approved.
- For verified, exactly tenant-resolved inbound events, the webhook should
  create or update a minimal `email_inbound_messages` placeholder from Resend
  metadata before workflow dispatch. The placeholder must not include body text,
  rendered HTML, attachment bytes, signed attachment URLs, or Support Hub rows;
  Inngest fills those in through durable steps.
- The first Inngest inbound routing flow should require the received email body
  before creating or threading a Support Hub message. Attachment retrieval should
  not block routing once the body is available; attachment status can remain
  pending, retryable, failed, or added later.
- After the body is available, route automatically when the inbound email
  matches a known Support Hub inbox route: configured inbox address, configured
  alias, reply/thread headers matching an existing support conversation, or a
  tenant-approved default catch-all route for that receiving domain. Do not make
  a new sender, unusual subject, or attachment presence trigger manual approval
  by itself.
- Use lightweight inbound routing review only when a tenant-owned email does not
  match a known route or matches multiple safe candidate routes. Authorized
  tenant staff should be able to choose an inbox and save an alias or default
  route so future matching emails route automatically.
- Any authenticated support agent in the owning tenant may save the reviewed
  route. The saved route must remain tenant-scoped, audit logged, and protected
  by product authorization and work-claim checks so retries, replays, or repeat
  clicks cannot create duplicate or cross-tenant routing rules.
- Saving the reviewed route should immediately continue routing the same inbound
  email through the durable Support Hub routing path. Do not require a second
  staff click or wait for a scheduled scan unless immediate dispatch fails and
  normal recovery needs to pick it up.
- Save-and-continue routing should reuse the existing inbound email identity,
  dispatch request, and product work claim where possible so retries, replays,
  or repeat clicks cannot create duplicate Support Hub messages.
- A reviewed route should save the exact recipient address or alias by default.
  Creating or changing a tenant receiving-domain default must be an explicit
  staff choice, not an automatic side effect of reviewing one email.
- If staff chooses a tenant receiving-domain default, require an extra
  confirmation that explains the rule may route future emails for many
  addresses on that receiving domain. Exact recipient and alias saves do not
  need this broader-domain confirmation.
- Route-save audit data should record the selected scope, such as recipient
  address, alias, or tenant-domain default, so later replay and support review
  can tell whether the route was narrow or intentionally broad.
- Route-save audit data should record the domain-default confirmation result
  when the selected scope is tenant-domain default.
- Tenant admins should be able to view, edit, disable, and delete active saved
  inbound routing rules for their own tenant. These changes must remain
  tenant-scoped and audit logged.
- Deleting a saved route removes the active future routing rule; it must not
  erase the audit history for previously saved, changed, or used routes.
- Pending inbound email should use the current active route state when routing
  resumes, while already routed Support Hub messages should keep their
  historical routing audit trail.
- If a route edit, disable, delete, or new save resolves pending inbound email
  that was waiting for routing, the product may immediately resume routing for
  that pending email through the same durable Support Hub routing path. The
  resumed run should re-read current tenant route state inside a workflow step
  instead of trusting stale route details from an old event payload.
- Route changes must not silently move or rewrite already routed Support Hub
  messages. Any future reroute feature for already routed messages should be a
  separate explicit staff action with its own audit trail.
- Any authenticated support agent in the owning tenant may move an already
  routed Support Hub message or conversation to a different tenant inbox through
  an explicit audited action. This action should record the actor, tenant,
  message or conversation identity, original inbox, destination inbox, and
  timestamp.
- Support message moves must be limited to tenant-owned source and destination
  inboxes.
- Moving an already routed Support Hub message must append routing history
  instead of erasing or rewriting the original route decision.
- Moving an already routed Support Hub message or conversation must require a
  short staff-entered reason. Store the reason with the move audit entry so
  tenant staff can understand the correction later.
- The move reason should be free text only. Do not add preset reason choices for
  the first implementation; they create reporting categories the product has not
  agreed to maintain yet.
- The move-reason UI should use existing shared `@asym/ui` form primitives, the
  repo's Maia/Zinc design tokens, and the surrounding Support Hub modal/drawer
  form pattern. Do not hardcode colors, spacing, radius, or route-specific
  custom controls for this field.
- Move-reason validation should be intentionally light: trim whitespace, require
  5-500 characters after trimming, and do not enforce grammar, preset
  categories, special formatting, or a longer minimum that could block a quick
  routing correction.
- Moving an already routed Support Hub message should not send automatic staff
  email. Show the move in Support Hub activity and history instead.
- Do not create a Resend outbound email for routine message-move notifications
  in the first implementation. If in-app destination inbox alerts are added
  later, they should be a separate notification-settings decision.
- The original inbox should retain a quiet "moved to" activity or history entry
  after a message or conversation is moved. This entry should point to the
  destination inbox and move audit trail without keeping a duplicate replyable
  message in the original inbox.
- The original-inbox move marker should use existing Support Hub activity
  styling, shared `@asym/ui` primitives, and Maia/Zinc design tokens. Do not use
  a loud notification treatment, hardcoded colors, or custom route-specific
  badges for this marker.
- The destination inbox should show the moved message normally, with a quiet
  "moved from" activity or history entry that points back to the original inbox
  and move audit trail.
- The destination-inbox move marker should use existing Support Hub activity
  styling, shared `@asym/ui` primitives, and Maia/Zinc design tokens. Do not use
  a prominent banner, hardcoded colors, or custom route-specific controls for
  this marker.
- When a message or conversation is moved, keep the current assignee only if
  that agent still has access to the destination inbox in the owning tenant. If
  the assignee does not have destination inbox access, clear the assignee.
- Message-move audit should record whether the assignee was retained or cleared,
  including the previous assignee identity when one existed.
- If the assignee is cleared during a move, leave the message unassigned in the
  destination inbox queue. Do not automatically run destination-inbox
  round-robin and do not require the moving agent to choose a new assignee as
  part of the move.
- Existing destination-inbox assignment or automation rules may pick up the
  unassigned message later if the tenant has configured them, but that is a
  separate assignment workflow rather than a hidden side effect of moving the
  message.
- Keep labels and priority on the moved Support Hub message or conversation by
  default. The destination inbox staff may change labels or priority later, but
  moving the message should not erase useful context or require extra
  label/priority questions.
- Message-move audit should record that labels and priority were retained by
  default, including the priority value and label IDs present at move time.
- Keep the current Support Hub status on the moved message or conversation by
  default, including `open`, `pending`, `snoozed`, or `resolved`. Moving changes
  the inbox, not the work state.
- Message-move audit should record the retained status value present at move
  time.
- If the message or conversation is `resolved`, show a quiet confirmation before
  moving it. The move remains allowed, and the `resolved` status remains
  retained unless staff changes status through a separate status action.
- The resolved-move confirmation should use the existing Support Hub
  modal/drawer confirmation pattern, shared `@asym/ui` primitives, and Maia/Zinc
  design tokens. Do not use a loud banner, custom color treatment, or separate
  alert workflow.
- If the message or conversation is `snoozed`, keep the snooze timer by default,
  including the stored `snoozedUntil` value. Moving changes the inbox, not when
  the work should reappear.
- The move action must not clear or change snooze timing. Staff should use the
  normal snooze or unsnooze action if they want to change when the message
  reappears.
- Message-move audit should record the retained `snoozedUntil` value when the
  moved message or conversation is snoozed.
- Do not add a separate move-specific snooze note or warning when moving a
  snoozed message. The retained `snoozed` status and normal Support Hub snooze
  indicators are responsible for showing that the message remains snoozed.
- Bulk moving multiple Support Hub messages or conversations is allowed only
  when every item goes through the same safeguards as a single-message move:
  tenant-owned source and destination inbox checks, required reason,
  audit/history entries, assignee retention or clearing, label and priority
  retention, status and snooze retention, resolved confirmation when needed, and
  quiet original/destination move markers.
- Bulk move execution should be idempotent per moved message or conversation,
  not only per bulk request. Retry, replay, or partial failure recovery must not
  duplicate move audit entries or activity markers for items already moved.
- If Inngest is used for bulk move follow-up, fan out durable work per message
  or use per-message work claims so one failed item does not hide successful
  moves or force already-moved items to run again.
- Bulk move must not use reduced checks for speed. It may show a batch-level
  result summary to staff, but each item still needs item-level audit evidence.
- Bulk move uses one shared required free-text reason for the batch. Copy that
  reason into every item-level move audit entry.
- Each item-level audit entry must clearly say the move came from a batch move
  and include a stable `bulkMoveId` or equivalent operation identifier, actor,
  source inbox, destination inbox, moved item id, and retained or cleared move
  metadata needed for replay-safe investigation.
- A batch-level result summary or batch operation audit may supplement the
  item-level audit records, but it must not replace them.
- Bulk move may partially succeed. Successfully moved items should stay moved,
  failed items should stay unchanged in their original inbox, and staff should
  see a clear batch result summary with item-level success and failure states.
- Retrying or recovering a partially failed bulk move must target only failed
  items. It must not rerun successful item moves, duplicate successful move audit
  entries, or roll back successful moves because another item failed.
- Item-level bulk move failures should record safe, staff-readable failure
  reasons such as missing authorization, stale item state, or invalid
  destination. Do not expose provider secrets, workflow internals, stack traces,
  or cross-tenant details in staff-visible failure text.
- The batch result UI should include a `Retry failed` action when retryable
  failed items remain. This action should retry only failed items from the batch
  and must keep successful items untouched.
- `Retry failed` must call a product server endpoint or action that re-checks
  tenant authorization, reloads current item state, and creates or reuses product
  work claims before dispatching workflow retry work. The UI must not call
  Inngest or Resend directly.
- Repeat clicks on `Retry failed` should reuse the active retry attempt or return
  current retry status instead of creating duplicate workflow dispatches or
  duplicate item-level audit entries.
- Retry audit should link the retry attempt to the original `bulkMoveId` or
  equivalent operation identifier and record which failed items were retried.
- The retry action should use existing Support Hub controls, shared `@asym/ui`
  primitives, and Maia/Zinc design tokens. Do not introduce custom colors, loud
  banners, or route-specific controls for the first implementation.
- `Retry failed` should reuse the original bulk move reason. Do not ask staff
  for a second reason when the retry is part of the same batch correction.
- Retry audit should record that the original reason was reused, identify the
  retry attempt, and keep the original item-level move audit entries separate
  from retry-attempt audit records.
- If received-email body retrieval from Resend fails, keep the inbound email
  placeholder pending and retry body retrieval automatically through durable
  workflow steps. Do not route a Support Hub message from subject, sender, or
  placeholder metadata alone.
- If automatic body retrieval retries are exhausted, mark the placeholder as
  body retrieval failed and keep it visible to authorized tenant staff for safe
  retry. The retry must run through product authorization, product work claims,
  and workflow dispatch. Do not create an empty Support Hub message, delete the
  placeholder, or hide the failed inbound email.
- If a body retrieval retry is already active for the same tenant and inbound
  email, repeat staff clicks should reuse the active retry and return the
  current status instead of starting duplicate provider work.
- Support Hub messages should show a clear staff-visible attachment status when
  inbound attachments are pending, retrying, failed, or available. Do not expose
  Resend signed attachment URLs, raw attachment payloads, provider internals, or
  workflow step logs in that status.
- Authorized tenant staff should be able to request attachment retry from the
  Support Hub message for failed, pending, or stale inbound attachments. The
  retry must run through product authorization, product work claims, and
  workflow dispatch; the UI must never call Resend directly or receive API keys,
  signed attachment URLs, raw provider payloads, or attachment bytes as part of
  the retry request.
- If an attachment retry is already active for the same tenant, inbound email,
  and provider attachment identity when available, repeat staff clicks should
  reuse the active retry and return the current status instead of starting
  duplicate provider work.

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
