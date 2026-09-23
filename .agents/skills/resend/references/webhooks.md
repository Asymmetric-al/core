# Webhooks

Receive real-time notifications when email events occur (delivered, bounced, opened, received, etc.).

## When to Use Webhooks

- Track delivery status in your database
- Remove bounced addresses from mailing lists
- Trigger follow-up actions when emails are opened/clicked
- Process inbound emails (`email.received`)
- Create alerts for failures or complaints
- Build custom analytics dashboards

## Event Types

### Email Delivery Events

| Event | Trigger | Use Case |
|-------|---------|----------|
| `email.sent` | API request successful, delivery attempted | Confirm email accepted |
| `email.delivered` | Email reached recipient's mail server | Confirm successful delivery |
| `email.bounced` | Mail server permanently rejected (hard bounce) | Remove from list, alert user |
| `email.complained` | Recipient marked as spam | Unsubscribe, review content |
| `email.opened` | Recipient opened email | Track engagement |
| `email.clicked` | Recipient clicked a link | Track engagement |
| `email.delivery_delayed` | Temporary delivery issue (soft bounce) | Monitor, may resolve automatically |
| `email.failed` | Send error (invalid recipient, quota, etc.) | Debug, alert |

### Inbound Email Events

| Event | Trigger | Use Case |
|-------|---------|----------|
| `email.received` | Email received at your inbound domain | Process incoming email, auto-reply, forward |

The `email.received` payload contains metadata only (sender, recipient, subject, attachment list) — not the email body. Call `resend.emails.receiving.get()` to retrieve the body content. See [receiving.md](receiving.md) for full details.

### Bounce Types

| Type | Event | Action |
|------|-------|--------|
| **Hard bounce (Permanent)** | `email.bounced` | Remove address immediately — never retry |
| **Soft bounce (Transient)** | `email.delivery_delayed` | Monitor — Resend retries automatically |
| **Undetermined** | `email.bounced` | Treat as hard bounce if repeated |

**Hard bounces** (`email.bounced`) are permanent failures. The address is invalid and will never accept mail. Continuing to send to hard-bounced addresses destroys your sender reputation.

| Subtype | Cause |
|---------|-------|
| General | Recipient's email provider sent a hard bounce |
| NoEmail | Address doesn't exist or couldn't be determined |

**Soft bounces** (`email.delivery_delayed`) are temporary issues. Resend automatically retries these. If delivery ultimately fails after retries, you'll receive an `email.bounced` event.

| Subtype | Cause | May Resolve If... |
|---------|-------|-------------------|
| General | Temporary rejection | Underlying issue clears |
| MailboxFull | Recipient's inbox at capacity | Recipient frees space |
| MessageTooLarge | Exceeds provider size limit | You reduce message size |
| ContentRejected | Contains disallowed content | You modify content |
| AttachmentRejected | Attachment type/size rejected | You modify attachment |

### Other Events

| Event | Trigger |
|-------|---------|
| `domain.created` / `updated` / `deleted` | Domain configuration changes |
| `contact.created` / `updated` / `deleted` | Contact list changes (not from CSV imports) |

## Setup

1. **Create endpoint** — POST endpoint that returns HTTP 200
2. **Add webhook** — In Resend dashboard (resend.com/webhooks), add your URL and select events
3. **Verify signatures** — **REQUIRED** — See [Signature Verification](#signature-verification)
4. **Test locally** — Use ngrok, Tailscale Funnel, or similar for local development

### Create Webhook via API

**Prefer the API** to create webhooks programmatically instead of using the dashboard. This is faster, less error-prone, and gives you the signing secret directly in the response.

#### Node.js

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.webhooks.create({
  endpoint: 'https://example.com/webhook',
  events: ['email.delivered', 'email.bounced', 'email.received'],
});

if (error) {
  console.error('Failed to create webhook:', error);
  throw error;
}

// IMPORTANT: Store the signing secret — you need it to verify incoming webhooks
console.log('Webhook created:', data.id);
console.log('Signing secret:', data.signing_secret); // whsec_xxxxxxxxxx
```

#### Python

```python
import resend

resend.api_key = 're_xxxxxxxxx'

webhook = resend.Webhooks.create(params={
    "endpoint": "https://example.com/webhook",
    "events": ["email.delivered", "email.bounced", "email.received"],
})

print(f"Webhook created: {webhook['id']}")
print(f"Signing secret: {webhook['signing_secret']}")
```

#### cURL

```bash
curl -X POST 'https://api.resend.com/webhooks' \
  -H 'Authorization: Bearer re_xxxxxxxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "endpoint": "https://example.com/webhook",
    "events": ["email.delivered", "email.bounced", "email.received"]
  }'

# Response:
# {
#   "object": "webhook",
#   "id": "4dd369bc-aa82-4ff3-97de-514ae3000ee0",
#   "signing_secret": "whsec_xxxxxxxxxx"
# }
```

The `signing_secret` is only returned once when you create the webhook. Store it as `RESEND_WEBHOOK_SECRET` immediately.

### Webhook Management (List, Get, Update, Delete)

| Operation | Node.js | Python |
|-----------|---------|--------|
| List | `resend.webhooks.list()` | `resend.Webhooks.list()` |
| Get | `resend.webhooks.get(id)` | `resend.Webhooks.get(id)` |
| Update | `resend.webhooks.update(id, params)` | `resend.Webhooks.update(params)` — `webhook_id` inside params |
| Delete | `resend.webhooks.remove(id)` | `resend.Webhooks.remove(id)` |
| Rotate Signing Secret | `resend.webhooks.rotateSigningSecret(id)` | `resend.Webhooks.rotate_signing_secret(webhook_id)` |
| List Events | `resend.webhooks.events.list({ webhookId, ...params })` | `resend.Webhooks.list_events(webhook_id, params?)` |
| Get Event | `resend.webhooks.events.get({ webhookId, eventId })` | `resend.Webhooks.get_event(webhook_id, event_id)` |
| Replay Event | `resend.webhooks.events.replay({ webhookId, eventId })` | `resend.Webhooks.replay_event(webhook_id, event_id)` |
| List Event Attempts | `resend.webhooks.events.attempts.list({ webhookId, eventId, ...params })` | `resend.Webhooks.list_event_attempts(webhook_id, event_id, params?)` |

```typescript
// List all webhooks
const { data: webhooks, error: listError } = await resend.webhooks.list();

// Update endpoint URL or subscribed events
const { data: updated, error: updateError } = await resend.webhooks.update(
  '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
  {
    endpoint: 'https://new-domain.com/webhook',
    events: ['email.delivered', 'email.bounced'],
  }
);

// Delete a webhook
const { data: deleted, error: deleteError } = await resend.webhooks.remove('4dd369bc-aa82-4ff3-97de-514ae3000ee0');

// Rotate the signing secret — for 24 hours payloads are signed with both secrets, then only the new one
const { data: rotated, error: rotateError } = await resend.webhooks.rotateSigningSecret('4dd369bc-aa82-4ff3-97de-514ae3000ee0');
// rotated: { object: 'webhook', id, signing_secret: 'whsec_...' }
// Update RESEND_WEBHOOK_SECRET with rotated.signing_secret right away
```

**Key gotchas:**
- `signing_secret` is in the create, get, and rotate responses — read it back with `get`, rotate it if it leaked
- Update can change `endpoint` and `events` — partial updates supported
- Use `.remove()` not `.delete()` in the Node.js SDK

### Delivery History (Events and Attempts)

Inspect what Resend delivered to a webhook and how the endpoint responded. Use this
to debug an endpoint that is missing events or returning errors, instead of asking
the user to check the dashboard.

```typescript
// 1. Find the event — most recent first, forward-only pagination
const { data: events, error } = await resend.webhooks.events.list({
  webhookId: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
  limit: 20,
});
if (error) throw error;
// events.data[i]: { id, type, created_at, status }
// status: 'pending' | 'attempting' | 'success' | 'failed'
const eventId = events.data[0].id;

// 2. See the exact payload Resend sent, and when the next retry is due
const { data: event } = await resend.webhooks.events.get({
  webhookId: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
  eventId,
});
// event.next_attempt_at is null once status is 'success' or 'failed'
// event.payload is the JSON body your endpoint received

// 3. Manually replay a failed or missed event — queues one more delivery
const { data: replayed, error: replayError } = await resend.webhooks.events.replay({
  webhookId: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
  eventId,
});
// replayed.id is the same event ID — replay does not schedule automatic retries

// 4. See what your endpoint returned on each try
const { data: attempts } = await resend.webhooks.events.attempts.list({
  webhookId: '4dd369bc-aa82-4ff3-97de-514ae3000ee0',
  eventId,
});
// attempts.data[i]: { id, http_status_code, response, sent_at }
```

Both lists take `limit` (1–100, default 20) and `after` (the last `id` of the
previous page). There is no `before` — the API rejects it with a 422.

Replay returns a 422 if the webhook is disabled, or if the event's payload is
no longer available.

## Signature Verification

**Verify webhook signatures on every request.** Without verification, anyone can send fake webhooks to your endpoint.

### Why Verification Matters

- Webhooks are unauthenticated HTTP POST requests
- Anyone who knows your endpoint URL can send fake events
- Verification ensures the webhook genuinely came from Resend
- Unique signatures prevent re-use of old payloads

### Required Headers

Every webhook includes these headers for verification:

| Header | Purpose |
|--------|---------|
| `svix-id` | Unique message identifier |
| `svix-timestamp` | Unix timestamp when sent |
| `svix-signature` | Cryptographic signature |

### Get Your Webhook Secret

Find your signing secret in the Resend dashboard:
1. Go to resend.com/webhooks
2. Click on your webhook
3. Copy the signing secret (starts with `whsec_`)

Store it securely as `RESEND_WEBHOOK_SECRET` environment variable.

### Using Resend SDK (Recommended)

Example using Next.js:

```typescript
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Important: Use raw body, not parsed JSON
    const payload = await req.text();

    // Throws an error if the webhook is invalid
    const event = resend.webhooks.verify({
      payload,
      headers: {
        'svix-id': req.headers.get('svix-id'),
        'svix-timestamp': req.headers.get('svix-timestamp'),
        'svix-signature': req.headers.get('svix-signature'),
      },
      secret: process.env.RESEND_WEBHOOK_SECRET,
    });

    switch (event.type) {
      case 'email.delivered':
        // Update database with delivery status
        break;
      case 'email.bounced':
        // Hard bounce — remove from mailing list immediately
        break;
      case 'email.complained':
        // Spam complaint — unsubscribe and flag
        break;
      case 'email.received':
        // Inbound email — retrieve body and process
        const { data: email } = await resend.emails.receiving.get(event.data.email_id);
        break;
      default:
        break;
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return new NextResponse('Invalid signature', { status: 400 });
  }
}
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Not verifying signatures | **Always verify** — unverified webhooks can't be trusted |
| Using parsed JSON body | Use raw request body — JSON parsing breaks signature |
| Using `express.json()` middleware | Use `express.raw()` for webhook routes |
| Hardcoding webhook secret | Store in environment variable |
| Returning non-200 status for valid webhooks | Return 200 OK to acknowledge receipt |

## Retry Schedule

If your endpoint doesn't return HTTP 200, Resend retries with exponential backoff:

| Attempt | Delay After Failure |
|---------|---------------------|
| 1 | Immediate |
| 2 | 5 seconds |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |
| 6 | 5 hours |
| 7 | 10 hours |

**Tip:** Always return 200 quickly, then process asynchronously if needed. You can manually replay failed webhooks from the dashboard, and inspect each attempt's `http_status_code` and response body through the API — see [Delivery History](#delivery-history-events-and-attempts).

## IP Allowlist

If your firewall requires allowlisting, webhooks come from:

```
44.228.126.217
50.112.21.217
52.24.126.164
54.148.139.208
```

IPv6: `2600:1f24:64:8000::/52`

## Local Development

Use tunneling tools to test webhooks locally:

```bash
# Tailscale Funnel (recommended — permanent URL)
sudo tailscale funnel 3000

# ngrok
ngrok http 3000
# Then use the tunnel URL in Resend dashboard
```

## Event Payload Example

```json
{
  "type": "email.delivered",
  "created_at": "2024-01-15T12:00:00.000Z",
  "data": {
    "email_id": "ae2014de-c168-4c61-8267-70d2662a1ce1",
    "from": "Acme <noreply@acme.com>",
    "to": ["delivered@resend.dev"],
    "subject": "Welcome to Acme"
  }
}
```
