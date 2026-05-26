# Advanced Patterns — Rate Limiting, Content Limits, Troubleshooting

## Rate Limiting per Sender

Prevent any single sender from overwhelming your agent with emails:

```typescript
const rateLimiter = new Map<string, { count: number; resetAt: Date }>();

function checkRateLimit(sender: string, maxPerHour: number = 10): boolean {
  const now = new Date();
  const entry = rateLimiter.get(sender);

  if (!entry || entry.resetAt < now) {
    rateLimiter.set(sender, { count: 1, resetAt: new Date(now.getTime() + 3600000) });
    return true;
  }

  if (entry.count >= maxPerHour) {
    return false;
  }

  entry.count++;
  return true;
}
```

## Content Length Limits

Prevent token stuffing by truncating oversized email content:

```typescript
const MAX_BODY_LENGTH = 10000;  // Prevent token stuffing

function truncateContent(content: string): string {
  if (content.length > MAX_BODY_LENGTH) {
    return content.slice(0, MAX_BODY_LENGTH) + '\n[Content truncated for security]';
  }
  return content;
}
```

## Stripping Quoted Threads

Before analyzing email content for safety, strip quoted reply threads. Old instructions buried in `>` quoted sections or `On [date], [person] wrote:` blocks could contain unintended directives hidden in legitimate-looking reply chains.

```typescript
function stripQuotedContent(text: string): string {
  return text
    // Remove lines starting with >
    .split('\n')
    .filter(line => !line.trim().startsWith('>'))
    .join('\n')
    // Remove "On ... wrote:" blocks
    .replace(/On .+wrote:[\s\S]*$/gm, '')
    // Remove "From: ... Sent: ..." forwarded headers
    .replace(/^From:.+\nSent:.+\nTo:.+\nSubject:.+$/gm, '');
}
```

This is critical for Level 3+ security. Even emails from trusted senders can contain quoted sections with malicious content.

## Troubleshooting

### "Cannot read properties of undefined (reading 'verify')"

**Cause:** Resend SDK version too old — `resend.webhooks.verify()` was added in recent versions.
**Fix:** Update to the latest SDK:
```bash
npm install resend@latest
```
Or use the Svix fallback (see [webhook-setup.md](webhook-setup.md)).

### "Cannot read properties of undefined (reading 'get')"

**Cause:** Resend SDK version too old — `emails.receiving.get()` requires a recent SDK.
**Fix:**
```bash
npm install resend@latest
# Verify version:
npm list resend
```

### Webhook returns 400 errors

**Possible causes:**
1. **Wrong signing secret** — The signing secret is returned when you create the webhook via the API (`data.signing_secret`). If you've lost it, delete and recreate the webhook to get a new one.
2. **Body parsing issue** — You must use the raw body for verification. Use `express.raw({ type: 'application/json' })` on the webhook route, not `express.json()`.
3. **SDK version too old** — Update to `resend@latest`.

### ngrok connection refused / tunnel died

**Cause:** Free ngrok tunnels time out and change URLs on restart.
**Fix:** Restart ngrok, then delete and recreate the webhook via the API with the new tunnel URL.
**Better:** Use Tailscale Funnel or deploy to production.

### Email received but no webhook fires

1. Check the webhook is "Active" in Resend dashboard → Webhooks
2. Check the endpoint URL is correct (including the path, e.g., `/webhook`)
3. Check the tunnel is running: `curl https://<your-tunnel-url>`
4. Check the "Recent Deliveries" section on your webhook for status codes

### Security check rejecting all emails

1. Check the sender address is in your `ALLOWED_SENDERS` list
2. Check for case mismatch — the comparison should be case-insensitive
3. Debug by logging: `console.log('Sender:', event.data.from.toLowerCase())`

### Agent doesn't auto-respond to emails

**This is expected behavior.** The webhook delivers a notification to the user, who then instructs the agent how to respond. This is the safest approach — the user reviews each email before the agent acts on it.
