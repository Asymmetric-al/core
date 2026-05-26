# Webhook Setup — Tunneling, Registration, and Local Dev

## Table of Contents

- [Register Webhook via the API](#register-webhook-via-the-api)
- [Webhook Signing Secret and Verification](#webhook-signing-secret-and-verification)
- [Webhook Retry Behavior](#webhook-retry-behavior)
- [Local Development with Tunneling](#local-development-with-tunneling)
- [Webhook Path](#webhook-path)
- [Production Deployment](#production-deployment)
- [Clawdbot Integration](#clawdbot-integration)

## Register Webhook via the API

**Prefer the Resend Webhook API** to create webhooks programmatically instead of asking users to do it manually in the dashboard. This is faster, less error-prone, and gives you the signing secret directly in the response.

The API endpoint is `POST https://api.resend.com/webhooks`. You need:
- `endpoint` (string, required): Your full public webhook URL (e.g., `https://<your-tunnel-domain>/webhook`)
- `events` (string[], required): Event types to subscribe to. For an agent inbox, use `["email.received"]`

The response includes a `signing_secret` (format: `whsec_xxxxxxxxxx`) — **store this immediately** as `RESEND_WEBHOOK_SECRET`. This is the only time you'll see it in the response.

### Node.js

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.webhooks.create({
  endpoint: 'https://<your-tunnel-domain>/webhook',
  events: ['email.received'],
});

if (error) {
  console.error('Failed to create webhook:', error);
  throw error;
}

// IMPORTANT: Store the signing secret — you need it to verify incoming webhooks
// Write it directly to .env, never log it
console.log('Webhook created:', data.id);
```

### Python

```python
import resend

resend.api_key = 're_xxxxxxxxx'

webhook = resend.Webhooks.create(params={
    "endpoint": "https://<your-tunnel-domain>/webhook",
    "events": ["email.received"],
})

print(f"Webhook created: {webhook['id']}")
```

### cURL

```bash
curl -X POST 'https://api.resend.com/webhooks' \
  -H 'Authorization: Bearer re_xxxxxxxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "endpoint": "https://<your-tunnel-domain>/webhook",
    "events": ["email.received"]
  }'

# Response:
# {
#   "object": "webhook",
#   "id": "4dd369bc-aa82-4ff3-97de-514ae3000ee0",
#   "signing_secret": "whsec_xxxxxxxxxx"
# }
```

### Other SDKs

The webhook creation API is available in all Resend SDKs: Go, Ruby, PHP, Rust, Java, and .NET. The pattern is the same — pass `endpoint` and `events`, and read `signing_secret` from the response.

## Webhook Signing Secret and Verification

The `signing_secret` returned when you create a webhook is used to verify that incoming webhook requests actually came from Resend. **You must verify every webhook request.**

Every webhook request includes three headers:

| Header | Purpose |
|--------|---------|
| `svix-id` | Unique message identifier |
| `svix-timestamp` | Unix timestamp when the webhook was sent |
| `svix-signature` | Cryptographic signature for verification |

Use `resend.webhooks.verify()` to validate these headers against the raw request body. The verification is sensitive to the exact bytes — if your framework parses and re-stringifies the JSON before you verify, the signature check will fail.

### Webhook Verification Fallback (Svix)

If you're using an older Resend SDK that doesn't have `resend.webhooks.verify()`, verify signatures directly with the `svix` package:

```bash
npm install svix
```

```javascript
import { Webhook } from 'svix';

const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET);
const event = wh.verify(payload, {
  'svix-id': req.headers['svix-id'],
  'svix-timestamp': req.headers['svix-timestamp'],
  'svix-signature': req.headers['svix-signature'],
});
```

## Webhook Retry Behavior

Resend automatically retries failed webhook deliveries with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 5 seconds |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |
| 6 | 5 hours |
| 7 | 10 hours |

- Your endpoint must return 2xx status to acknowledge receipt
- If an endpoint is removed or disabled, retry attempts stop automatically
- Failed deliveries are visible in the Webhooks dashboard, where you can also manually replay events
- Emails are stored even if webhooks fail — you won't lose messages

## Local Development with Tunneling

Your local server isn't accessible from the internet. Use tunneling to expose it for webhook delivery.

> **Critical: Persistent URLs Required**
>
> Webhook URLs are registered with Resend via the API. If your tunnel URL changes (e.g., ngrok restart on the free tier), you must delete and recreate the webhook registration. For development, this is manageable. For anything persistent, you need either:
> - A **permanent tunnel** with stable URLs (Tailscale Funnel, paid ngrok, Cloudflare named tunnels)
> - **Production deployment** to a real server

### Tailscale Funnel (Recommended)

**Tailscale Funnel is the best solution for webhook development and persistent agent setups.** It provides a permanent, stable HTTPS URL with valid certificates — completely free, with no timeouts or session limits.

**Why Tailscale Funnel is better than ngrok for webhooks:**
- Permanent URL — Never changes, even across restarts
- No timeouts — Free tier has no 8-hour session limits
- Auto-reconnects — Survives machine reboots via systemd service
- Valid HTTPS certificates — Automatic, trusted TLS certificates
- Free forever — No paid tier required

**Quick setup:**
```bash
# 1. Install Tailscale (one-time)
curl -fsSL https://tailscale.com/install.sh | sh

# 2. Authenticate (one-time - opens browser)
sudo tailscale up

# 3. Enable Funnel (one-time approval in browser)
sudo tailscale funnel 3000

# Done! Your permanent URL:
# https://<machine-name>.tail<hash>.ts.net
```

**Running in background:**
```bash
# Tailscale Funnel runs as a systemd service automatically
# It will survive reboots and reconnect automatically

# Check status:
sudo tailscale funnel status

# Stop (if needed):
sudo tailscale funnel off
```

**Your webhook URL format:**
```
https://<machine-name>.tail<hash>.ts.net/webhook
```

### ngrok (Alternative)

**Free tier limitations:**
- URLs are random and change on every restart
- Must delete and recreate the webhook via the API after each restart
- Fine for initial testing, painful for ongoing development

**Paid tier ($8/mo Personal plan):**
- Static subdomain that persists across restarts
- Recommended if using ngrok long-term

```bash
# Install
brew install ngrok  # macOS

# Authenticate (free account required)
ngrok config add-authtoken <your-token>

# Start tunnel (free - random URL)
ngrok http 3000

# Start tunnel (paid - static subdomain)
ngrok http --domain=myagent.ngrok.io 3000
```

### Cloudflare Tunnel (Alternative)

**Named tunnel (persistent — recommended):**
```bash
# Install
brew install cloudflared  # macOS

# One-time setup
cloudflared tunnel login
cloudflared tunnel create my-agent-webhook

# Create config file ~/.cloudflared/config.yml
# Run tunnel
cloudflared tunnel run my-agent-webhook
```

Now `https://webhook.example.com` always points to your local machine.

**Pros:** Free, persistent URLs, uses your own domain
**Cons:** Requires owning a domain on Cloudflare, more setup

### VS Code Port Forwarding (Alternative)

Good for quick testing during development sessions.

1. Open Ports panel (View → Ports)
2. Click "Forward a Port"
3. Enter 3000 (or your port)
4. Set visibility to "Public"
5. Use the forwarded URL

**Note:** URL changes each VS Code session. Not suitable for persistent webhooks.

### localtunnel (Alternative)

Simple but ephemeral.

```bash
npx localtunnel --port 3000
```

**Note:** URLs change on restart. Same limitations as free ngrok.

## Webhook Path

Pick a webhook path and commit to it. This exact path will be registered with Resend, and if you change it later, webhooks will 404 silently.

> **Keep your webhook route path stable after registering it with Resend.** If you change `/webhook` to `/webhook/email`, Resend will keep sending to the old path and every delivery will 404. If you need to change the path, update or recreate the webhook registration via the API.

**Recommended path:** `/webhook`

## Production Deployment

For a reliable agent inbox, deploy your webhook endpoint to production infrastructure instead of relying on tunnels.

### Recommended Approaches

**Option A: Deploy webhook handler to serverless**
- Vercel, Netlify, or Cloudflare Workers
- Zero server management, automatic HTTPS
- Free tiers available for low volume

**Option B: Deploy to a VPS/cloud instance**
- Your webhook handler runs alongside your agent
- Use nginx/caddy for HTTPS termination

**Option C: Use your agent's existing infrastructure**
- If your agent already runs on a server with a public IP
- Add webhook route to existing web server

### Example: Deploying to Vercel

```bash
vercel deploy --prod
# Your webhook URL becomes:
# https://your-project.vercel.app/webhook
```

## Clawdbot Integration

### Webhook Gateway (Recommended)

The best way to connect email to Clawdbot is via the webhook gateway:

```typescript
async function processWithAgent(email: ProcessedEmail) {
  const message = `
New Email
From: ${email.from}
Subject: ${email.subject}

${email.body}
  `.trim();

  await sendToClawdbot(message);
}
```

### Alternative: Polling

Clawdbot can poll the Resend API for new emails during heartbeats. This is simpler to set up but does not take advantage of real-time delivery.

### Alternative: External Channel Plugin

For deep integration, implement Clawdbot's external channel plugin interface to treat email as a first-class channel.
