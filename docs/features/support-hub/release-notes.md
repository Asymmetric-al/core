# Support Hub — Release notes (Phase 8)

This is the rollout reference for the Donor Care Support Hub after the Phase 8
persistence cutover.

## What Ships

- Persistent, tenant-scoped Support Hub tables in
  `supabase/migrations/20260515025814_support_hub_core_modules.sql`, with a
  paired rollback file.
- RLS on every `support_*` table. Staff access is scoped through the existing
  `authz.current_tenant_id()` and `authz.has_staff_membership(...)` helpers;
  super admins retain operational cross-tenant access.
- `packages/api/src/admin/support-hub/adapter/index.ts` now uses
  `supabaseSupportHubAdapter` as the live adapter. The in-memory adapter remains
  for fast parity tests only.
- Mission Control Support Hub hooks now read and mutate through
  `/api/admin/support/**` route handlers. The browser no longer writes
  `supportStore.collections.*` directly.
- Browser TanStack DB collections in
  `packages/database/collections/support-hub.ts` are a tenant-scoped read
  cache over those routes (`startSync: false`). Schema lives in
  `packages/database/collections/support-hub.schema.ts`. Give Hope seed is
  not the collection interface; it lives only in in-memory adapter fixtures.
  `support_messages` is local-only identity; thread messages stay
  conversation-scoped.
- Resend `email.received` events call `routeInboundToSupportHub()`, persist
  inbound threading headers, and bridge routed inbound rows to Support Hub
  conversation/message ids.
- Production onboarding defaults live behind
  `private.seed_support_hub_defaults(tenant_id, support_email, from_email,
from_name, timezone)`. The function is service-role-only and does not seed
  demo conversations into production.

## Migration

Apply:

```bash
supabase db push
```

Rollback file:

```text
supabase/migrations/rollback_20260515025814_support_hub_core_modules.sql
```

The migration creates:

- Inbox, agent, team, label, business-hours, SLA, signature, inbox-settings,
  conversation, message, attachment, saved-view, macro, canned-response,
  automation, notification-preference, assignment, and audit-log tables.
- Bridge columns on `email_inbound_messages`: `conversation_id`,
  `support_message_id`, `message_id_header`, `in_reply_to_header`, and
  `references_headers`.
- Tenant indexes for common inbox, status, assignee, label, threading, and
  message lookups.

## Inbound Email

Inbound routing order:

1. Validate the envelope.
2. Resolve the inbox by explicit `inboxId` or by matching recipients to a
   tenant-scoped inbox inbound address.
3. Thread by `In-Reply-To` / `References` headers.
4. Fall back to an open conversation with the same inbox, sender, and normalized
   subject.
5. Create a new conversation if no thread matches.
6. Insert the inbound `support_messages` row and update the Resend inbound row
   with the Support Hub ids.

## Seed Posture

Production tenants start without demo conversations or messages. Run the private
seed function once per tenant to create operational defaults:

```sql
select private.seed_support_hub_defaults(
  '<tenant_uuid>'::uuid,
  'support@example.org',
  'support@example.org',
  'Donor Care',
  'America/New_York'
);
```

Execute it only with a service-role connection.

## Still Deferred

- Outbound Support Hub provider delivery through Resend.
- CSAT collection and reports.
- Knowledge Base insertion in the reply composer.
- Live CRM hydration in the contact sidecar.
- Mention notification delivery and daily digests.
- Tenant-local SLA/business-hours calculations beyond persisted timezone data.

## Verification

Confirm collections stay route-backed and Give Hope seed stays out of the
browser module:

```bash
bunx vitest run tests/unit/packages/database/support-hub-collections.test.ts tests/unit/packages/database/collection-registry.test.ts
```

Phase 8 evidence is recorded at
`docs/ops/phase-evidence/2026-05-15_phase-08_mission-control-platform-ux-core-modules.md`.
