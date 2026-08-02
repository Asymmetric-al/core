# Eve operator notifications

Issue #436 adds durable platform-owner email and urgent Discord delivery. The
feature is intentionally inert after deployment: email and Discord are both
disabled and paused, and Eve's global release switch remains authoritative.

## Configuration

1. Apply the Supabase migration and verify the `notification_record` retention
   category, service-only RLS, and claim/complete functions.
2. Configure tenant Resend settings through the existing server-side email
   connection flow. Never put a Resend key in browser configuration.
3. Add `EVE_DISCORD_WEBHOOK_URL` only to the Eve runtime environment. Use an
   `https://discord.com/api/webhooks/...` URL; it is never persisted.
4. In Mission Control, enable eligible platform-owner email recipients, then
   enable and resume only the intended channel.
5. Keep the global release switch off until the #437 launch checklist passes.

## Safety and operations

- Email addresses come from current tenant `super_admin` profiles only.
- Discord receives high/critical events by default, with rich details off.
- Pause or disable a channel before rotating provider credentials.
- Inspect delivery state and #419 audit events in Mission Control. Stored
  provider outcomes are classifications only; no response body is retained.
- Retryable failures use exponential backoff and stop after three attempts or
  envelope expiry. A one-minute static Eve schedule claims due rows atomically.

## Rollback

Pause and disable both channels first, then remove the Discord environment
secret. Existing records remain under #424 retention/hold policy and cannot
trigger delivery while the channel or global governance gate is closed.
