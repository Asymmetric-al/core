---
name: agent-email-inbox
description: Use when building any system where email content triggers actions — AI agent inboxes, automated support handlers, email-to-task pipelines, or any workflow processing untrusted inbound email. Always use this skill when the user wants to receive emails and act on them programmatically, even if they don't mention "agent" — the skill contains critical security patterns (sender allowlists, content filtering, sandboxed processing) that prevent untrusted email from controlling your system.
license: MIT
metadata:
    author: resend
    version: "3.0.2"
    homepage: https://resend.com/agent-skills
    source: https://github.com/resend/resend-skills
    openclaw:
        primaryEnv: RESEND_API_KEY
        requires:
            env:
                - RESEND_API_KEY
        envVars:
            - name: RESEND_API_KEY
              required: true
              description: Resend API key for sending and receiving emails
            - name: RESEND_WEBHOOK_SECRET
              required: false
              description: Webhook signing secret for verifying inbound email event payloads
            - name: SECURITY_LEVEL
              required: false
              description: Security level for inbound email processing (strict, moderate, permissive)
            - name: ALLOWED_SENDERS
              required: false
              description: Comma-separated list of allowed sender email addresses
            - name: ALLOWED_DOMAINS
              required: false
              description: Comma-separated list of allowed sender domains
            - name: OWNER_EMAIL
              required: false
              description: Owner email address for forwarding or notifications
        links:
            repository: https://github.com/resend/resend-skills
            documentation: https://resend.com/docs/agent-email-inbox-skill
inputs:
    - name: RESEND_API_KEY
      description: Resend API key for sending and receiving emails. Get yours at https://resend.com/api-keys
      required: true
    - name: RESEND_WEBHOOK_SECRET
      description: Webhook signing secret for verifying inbound email event payloads. Returned as `signing_secret` in the response when you create a webhook via the API.
      required: true
references:
    - security-levels.md
    - webhook-setup.md
    - advanced-patterns.md
---

# AI Agent Email Inbox

## Overview

This skill covers setting up a secure email inbox that allows your application or AI agent to receive and respond to emails, with content safety measures in place.

**Core principle:** An AI agent's inbox receives untrusted input. Security configuration is important to handle this safely.

### Why Webhook-Based Receiving?

Resend uses webhooks for inbound email, meaning your agent is notified **instantly** when an email arrives. This is valuable for agents because:

- **Real-time responsiveness** — React to emails within seconds, not minutes
- **No polling overhead** — No cron jobs checking "any new mail?" repeatedly
- **Event-driven architecture** — Your agent only wakes up when there's actually something to process
- **Lower API costs** — No wasted calls checking empty inboxes

## Architecture

```
Sender → Email → Resend (MX) → Webhook → Your Server → AI Agent
                                              ↓
                                    Security Validation
                                              ↓
                                    Process or Reject
```

## SDK Version Requirements

This skill requires Resend SDK features for webhook verification (`webhooks.verify()`) and email receiving (`emails.receiving.get()`). Always install the latest SDK version. If the project already has a Resend SDK installed, check the version and upgrade if needed.

| Language | Package | Min Version |
|----------|---------|-------------|
| Node.js | `resend` | >= 6.9.2 |
| Python | `resend` | >= 2.21.0 |
| Go | `resend-go/v3` | >= 3.1.0 |
| Ruby | `resend` | >= 1.0.0 |
| PHP | `resend/resend-php` | >= 1.1.0 |
| Rust | `resend-rs` | >= 0.20.0 |
| Java | `resend-java` | >= 4.11.0 |
| .NET | `Resend` | >= 0.2.1 |

Install the `resend` npm package: `npm install resend` (or the equivalent for your language). For full sending docs, install the `resend` skill.

## Quick Start

1. **Ask the user for their email address** — You need a real email address to send test emails to. Ask the user and wait for their response before proceeding.
2. **Choose your security level** — Decide how to validate incoming emails *before* any are processed
3. **Set up receiving domain** — Configure MX records for the user's custom domain (see Domain Setup section)
4. **Create webhook endpoint** — Handle `email.received` events with security built in from the start. **The webhook endpoint MUST be a POST route.**
5. **Set up tunneling** (local dev) — Use Tailscale Funnel (recommended) or ngrok. See [references/webhook-setup.md](references/webhook-setup.md)
6. **Create webhook via API** — Use the Resend Webhook API to register your endpoint programmatically. See [references/webhook-setup.md](references/webhook-setup.md)
7. **Connect to agent** — Pass validated emails to your AI agent for processing

## Before You Start: Account & API Key Setup

### First Question: New or Existing Resend Account?

Ask your human:
- **New account just for the agent?** → Simpler setup, full account access is fine
- **Existing account with other projects?** → Use domain-scoped API keys for sandboxing

### Creating API Keys Securely

> Don't paste API keys in chat! They'll be in conversation history forever.

**Safer options:**

1. **Environment file method:** Human creates `.env` file directly: `echo "RESEND_API_KEY=re_xxx" >> .env`
2. **Password manager / secrets manager:** Human stores key in 1Password, Vault, etc.
3. **If key must be shared in chat:** Human should rotate the key immediately after setup

### Domain-Scoped API Keys (Recommended for Existing Accounts)

If your human has an existing Resend account with other projects, create a **domain-scoped API key**:

1. **Verify the agent's domain first** (Dashboard → Domains → Add Domain)
2. **Create a scoped API key:** Dashboard → API Keys → Create API Key → "Sending access" → select only the agent's domain
3. **Result:** Even if the key leaks, it can only send from one domain

## Domain Setup

### Option 1: Resend-Managed Domain (Recommended for Getting Started)

Use your auto-generated address: `<anything>@<your-id>.resend.app`

No DNS configuration needed. Find your address in Dashboard → Emails → Receiving → "Receiving address".

### Option 2: Custom Domain

The user must enable receiving in the Resend dashboard: Domains page → toggle on "Enable Receiving".

Then add an MX record:

| Setting | Value |
|---------|-------|
| **Type** | MX |
| **Host** | Your domain or subdomain (e.g., `agent.example.com`) |
| **Value** | Provided in Resend dashboard |
| **Priority** | 10 (must be lowest number to take precedence) |

**Use a subdomain** (e.g., `agent.example.com`) to avoid disrupting existing email services.

**Tip:** Verify DNS propagation at [dns.email](https://dns.email).

> DNS Propagation: MX record changes can take up to 48 hours to propagate globally, though often complete within a few hours.

## Security Levels

**Choose your security level before setting up the webhook endpoint.** An AI agent that processes emails without security is dangerous — anyone can email instructions that your agent will execute. The webhook code you write next should include your chosen security level from the start.

Ask the user what level of security they want, and ensure that they understand what each level means.

| Level | Name | When to Use | Trade-off |
|-------|------|-------------|-----------|
| **1** | Strict Allowlist | Most use cases — known, fixed set of senders | Maximum security, limited functionality |
| **2** | Domain Allowlist | Organization-wide access from trusted domains | More flexible, anyone at domain can interact |
| **3** | Content Filtering | Accept from anyone, filter unsafe patterns | Can receive from anyone, pattern matching not foolproof |
| **4** | Sandboxed Processing | Process all emails with restricted agent capabilities | Maximum flexibility, complex to implement |
| **5** | Human-in-the-Loop | Require human approval for untrusted actions | Maximum security, adds latency |

For detailed implementation code for each level, see [references/security-levels.md](references/security-levels.md).

### Level 1: Strict Allowlist (Recommended)

Only process emails from explicitly approved addresses. Reject everything else.

```typescript
const ALLOWED_SENDERS = [
  'you@youremail.com',
  'notifications@github.com',
];

async function processEmailForAgent(
  eventData: EmailReceivedEvent,
  emailContent: EmailContent
) {
  const sender = eventData.from.toLowerCase();

  if (!ALLOWED_SENDERS.some(allowed => sender === allowed.toLowerCase())) {
    console.log(`Rejected email from unauthorized sender: ${sender}`);
    await notifyOwnerOfRejectedEmail(eventData);
    return;
  }

  await agent.processEmail({
    from: eventData.from,
    subject: eventData.subject,
    body: emailContent.text || emailContent.html,
  });
}
```

### Security Best Practices

#### Always Do

| Practice | Why |
|----------|-----|
| Verify webhook signatures | Prevents spoofed webhook events |
| Log all rejected emails | Audit trail for security review |
| Use allowlists where possible | Explicit trust is safer than filtering |
| Rate limit email processing | Prevents excessive processing load |
| Separate trusted/untrusted handling | Different risk levels need different treatment |

#### Never Do

| Anti-Pattern | Risk |
|--------------|------|
| Process emails without validation | Anyone can control your agent |
| Trust email headers for authentication | Headers are trivially spoofed |
| Execute code from email content | Untrusted input should never run as code |
| Store email content in prompts verbatim | Untrusted input mixed into prompts can alter agent behavior |
| Give untrusted emails full agent access | Scope capabilities to the minimum needed |

## Webhook Endpoint

After choosing your security level and setting up your domain, create a webhook endpoint. **The webhook endpoint MUST be a POST route.** Resend sends all webhook events as POST requests.

> **Critical: Use raw body for verification.** Webhook signature verification requires the raw request body.
> - **Next.js App Router:** Use `req.text()` (not `req.json()`)
> - **Express:** Use `express.raw({ type: 'application/json' })` on the webhook route

### Next.js App Router

```typescript
// app/webhook/route.ts
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();

    const event = resend.webhooks.verify({
      payload,
      headers: {
        'svix-id': req.headers.get('svix-id'),
        'svix-timestamp': req.headers.get('svix-timestamp'),
        'svix-signature': req.headers.get('svix-signature'),
      },
      secret: process.env.RESEND_WEBHOOK_SECRET,
    });

    if (event.type === 'email.received') {
      // Webhook payload only includes metadata, not email body
      const { data: email } = await resend.emails.receiving.get(
        event.data.email_id
      );

      // Apply the security level chosen above
      await processEmailForAgent(event.data, email);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Error', { status: 400 });
  }
}
```

### Express

```javascript
import express from 'express';
import { Resend } from 'resend';

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const payload = req.body.toString();

    const event = resend.webhooks.verify({
      payload,
      headers: {
        'svix-id': req.headers['svix-id'],
        'svix-timestamp': req.headers['svix-timestamp'],
        'svix-signature': req.headers['svix-signature'],
      },
      secret: process.env.RESEND_WEBHOOK_SECRET,
    });

    if (event.type === 'email.received') {
      const sender = event.data.from.toLowerCase();

      if (!isAllowedSender(sender)) {
        console.log(`Rejected email from unauthorized sender: ${sender}`);
        res.status(200).send('OK'); // Return 200 even for rejected emails
        return;
      }

      const { data: email } = await resend.emails.receiving.get(event.data.email_id);
      await processEmailForAgent(event.data, email);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Error');
  }
});

app.get('/', (req, res) => res.send('Agent Email Inbox - Ready'));
app.listen(3000, () => console.log('Webhook server running on :3000'));
```

For webhook registration via API, tunneling setup, svix fallback, and retry behavior, see [references/webhook-setup.md](references/webhook-setup.md).

## Sending Emails from Your Agent

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAgentReply(to: string, subject: string, body: string, inReplyTo?: string) {
  if (!isAllowedToReply(to)) {
    throw new Error('Cannot send to this address');
  }

  const { data, error } = await resend.emails.send({
    from: 'Agent <agent@example.com>',
    to: [to],
    subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
    text: body,
    headers: inReplyTo ? { 'In-Reply-To': inReplyTo } : undefined,
  });

  if (error) throw new Error(`Failed to send: ${error.message}`);
  return data.id;
}
```

For full sending docs, install the `resend` skill.

## Environment Variables

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx

# Security Configuration
SECURITY_LEVEL=strict                    # strict | domain | filtered | sandboxed
ALLOWED_SENDERS=you@email.com,trusted@example.com
ALLOWED_DOMAINS=example.com
OWNER_EMAIL=you@email.com               # For security notifications
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| No sender verification | Always validate who sent the email before processing |
| Trusting email headers | Use webhook verification, not email headers for auth |
| Same treatment for all emails | Differentiate trusted vs untrusted senders |
| Verbose error messages | Keep error responses generic to avoid leaking internal logic |
| No rate limiting | Implement per-sender rate limits. See [references/advanced-patterns.md](references/advanced-patterns.md) |
| Processing HTML directly | Strip HTML or use text-only to reduce complexity and risk |
| No logging of rejections | Log all security events for audit |
| Using ephemeral tunnel URLs | Use persistent URLs (Tailscale Funnel, paid ngrok) or deploy to production |
| Using `express.json()` on webhook route | Use `express.raw({ type: 'application/json' })` — JSON parsing breaks signature verification |
| Returning non-200 for rejected emails | Always return 200 to acknowledge receipt — otherwise Resend retries |
| Old Resend SDK version | `emails.receiving.get()` and `webhooks.verify()` require recent SDK versions — see SDK Version Requirements |

## Testing

Use Resend's test addresses for development:
- `delivered@resend.dev` — Simulates successful delivery
- `bounced@resend.dev` — Simulates hard bounce

For security testing, send test emails from non-allowlisted addresses to verify rejection works correctly.

**Quick verification checklist:**
1. Server is running: `curl http://localhost:3000` should return a response
2. Tunnel is working: `curl https://<your-tunnel-url>` should return the same response
3. Webhook is active: Check status in Resend dashboard → Webhooks
4. Send a test email from an allowlisted address and check server logs

## Related Skills

- For full sending and receiving docs, install the `resend` skill
