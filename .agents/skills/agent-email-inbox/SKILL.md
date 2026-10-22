---
name: agent-email-inbox
description: Use when building any system where email content triggers actions — AI agent inboxes, automated support handlers, email-to-task pipelines, or any workflow processing untrusted inbound email. Always use this skill when the user wants to receive emails and act on them programmatically, even if they don't mention "agent" — the skill contains critical security patterns (sender allowlists, content filtering, sandboxed processing) that prevent untrusted email from controlling your system.
license: MIT
metadata:
    author: resend
    version: "4.1.0"
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
      required: false
references:
    - security-levels.md
    - webhook-setup.md
    - advanced-patterns.md
---

# AI Agent Email Inbox

## Overview

This skill covers setting up a secure email inbox that allows your application or AI agent to receive and respond to emails, with content safety measures in place.

**Core principle:** An AI agent's inbox receives untrusted input. Security configuration is important to handle this safely.

The skill builds the agent on a Resend **Inbox**. An inbox groups email into threads, and your agent replies inside the thread with one call. Resend sets the recipients and the threading headers. If the user has no custom domain, or their plan has no inbox available, use [Receiving without an inbox](#receiving-without-an-inbox) instead. The security levels are the same for both.

### Why Webhook-Based Receiving?

Resend uses webhooks for inbound email, meaning your agent is notified **instantly** when an email arrives. This is valuable for agents because:

- **Real-time responsiveness** — React to emails within seconds, not minutes
- **No polling overhead** — No cron jobs checking "any new mail?" repeatedly
- **Event-driven architecture** — Your agent only wakes up when there's actually something to process
- **Lower API costs** — No wasted calls checking empty inboxes

## Architecture

```
Sender → Email → Resend Inbox → inbox.email.received webhook → Your Server → AI Agent
                                                                     ↓
                                                           Security Validation
                                                                     ↓
                                                Process or Reject → Reply in the thread
```

## SDK Version Requirements

The inbox flow needs the Node.js SDK `resend` >= 6.34.1, which has `resend.inboxes.*` and the `inbox.*` webhook event types. Always install the latest SDK version. If the project already has a Resend SDK installed, check the version and upgrade if needed.

The Python SDK `resend` >= 2.50.0 also has the inbox methods. For the other languages, call the [Inboxes API](https://resend.com/docs/api-reference/inboxes/create-inbox) over HTTP until their SDK has inbox methods, or use [Receiving without an inbox](#receiving-without-an-inbox).

The table below lists the minimums for the Receiving flow: webhook verification (`webhooks.verify()`) and email receiving (`emails.receiving.get()`). The `resend` skill lists higher minimums because it also covers newer features such as domain claims (`domains.claims.*`). If both skills are loaded, use the higher version.

| Language | Package | Min Version |
|----------|---------|-------------|
| Node.js | `resend` | >= 6.9.2 |
| Python | `resend` | >= 2.21.0 |
| Go | `resend-go/v4` | >= 4.0.0 |
| Ruby | `resend` | >= 1.0.0 |
| PHP | `resend/resend-php` | >= 1.1.0 |
| Rust | `resend-rs` | >= 0.20.0 |
| Java | `resend-java` | >= 4.11.0 |
| .NET | `Resend` | >= 0.2.1 |

Install the `resend` npm package: `npm install resend` (or the equivalent for your language). For full sending docs, install the `resend` skill.

## Quick Start

1. **Ask the user for their email address.** You need a real email address to send test emails to. Ask the user and wait for their response before proceeding.
2. **Choose your security level.** Decide how to validate incoming emails *before* any are processed
3. **Set up the domain.** Verify the user's custom domain for sending, and for receiving unless the inbox uses forwarding (see Domain Setup section)
4. **Create the inbox.** Create the agent's address with `resend.inboxes.create()` (see Create the Inbox section)
5. **Create webhook endpoint.** Handle `inbox.email.received` events with security built in from the start. **The webhook endpoint MUST be a POST route.**
6. **Set up tunneling (local dev).** Use Tailscale Funnel (recommended) or ngrok. See [references/webhook-setup.md](references/webhook-setup.md)
7. **Create webhook via API.** Use the Resend Webhook API to register your endpoint programmatically. See [references/webhook-setup.md](references/webhook-setup.md)
8. **Connect to agent.** Pass validated emails to your AI agent, and reply in the thread

## Before You Start: Account & API Key Setup

### First Question: New or Existing Resend Account?

Ask your human:
- **New account just for the agent?** → Simpler setup, full account access is fine
- **Existing account with other projects?** → The agent needs a full access key, which reaches every project. Prefer a new account for the agent (see API Key Permissions)

### Creating API Keys Securely

> Don't paste API keys in chat! They'll be in conversation history forever.

**Safer options:**

1. **Environment file method:** Human creates `.env` file directly: `echo "RESEND_API_KEY=re_xxx" >> .env`
2. **Password manager / secrets manager:** Human stores key in 1Password, Vault, etc. <!-- pragma: allowlist secret -->
3. **If key must be shared in chat:** Human should rotate the key immediately after setup

### API Key Permissions

The agent's server needs a **full access** API key. A "Sending access" key can only reply, forward, create drafts and send drafts. Reading inbox emails or registering webhooks with it returns 401 `restricted_api_key`. A sending access key limited to one domain returns 403 on an inbox of another domain.

If your human has an existing Resend account with other projects, keep the risk contained:

1. **Use a dedicated account for the agent** when possible, so a leaked key cannot reach other projects
2. **Keep the key on the server only.** Never pass it to the AI model or put it in a prompt
3. **Rotate the key** if it was ever pasted in chat or committed

## Domain Setup

An inbox address lives on a custom domain the user has added to Resend. The domain must be verified for sending (DKIM and SPF). To receive email on it, either enable receiving on the domain, or create the inbox with `forwarding: true`.

**Use a subdomain** (e.g., `agent.example.com`) to avoid disrupting existing email services.

### Option 1: Receiving on the Domain (Recommended)

The user must enable receiving in the Resend dashboard: Domains page → toggle on "Enable Receiving".

Then add an MX record:

| Setting | Value |
|---------|-------|
| **Type** | MX |
| **Host** | Your domain or subdomain (e.g., `agent.example.com`) |
| **Value** | Provided in Resend dashboard |
| **Priority** | 10 (must be lowest number to take precedence) |

**Tip:** Verify DNS propagation at [dns.email](https://dns.email).

> DNS Propagation: MX record changes can take up to 48 hours to propagate globally, though often complete within a few hours.

### Option 2: Forwarding

Create the inbox with `forwarding: true` when the address already receives mail elsewhere (for example, Google Workspace) and the user cannot change its MX record. Resend gives the inbox a receiving address. The user sets up forwarding from their mailbox to it. Read the address from `receiving_address` with `resend.inboxes.get()`.

## Create the Inbox

Create one inbox for the agent's address:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.inboxes.create({
  emailAddress: 'agent@agent.example.com',
  name: 'AI Agent',
  fromName: 'Acme Agent',
});

if (error) throw new Error(`Failed to create inbox: ${error.message}`);
console.log('Inbox created:', data.id);
```

`fromName` is the name recipients see on the agent's replies. The part before the `@` can contain only letters, numbers, `.`, `_`, `%` and `-`, so `agent+test@` returns a 422. A 403 error means the plan has no inbox left; ask the user to upgrade or use [Receiving without an inbox](#receiving-without-an-inbox).

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
import type { GetInboxThreadEmailResponseSuccess as InboxEmail } from 'resend';

const ALLOWED_SENDERS = [
  'you@youremail.com',
  'notifications@github.com',
];

// `from` is either `address` or `Name <address>`. Compare the address only:
// a substring check would accept a display name such as "you@youremail.com".
function senderAddress(from: string): string {
  const match = from.match(/<([^<>]+)>\s*$/);
  return (match ? match[1] : from).trim().toLowerCase();
}

function isAllowedSender(from: string): boolean {
  const sender = senderAddress(from);
  return ALLOWED_SENDERS.some(allowed => sender === allowed.toLowerCase());
}

// Identifies the email, so the agent can reply in its thread
type ThreadRef = { inboxId: string; threadId: string; emailId: string };

async function processEmailForAgent(email: InboxEmail, thread: ThreadRef) {
  if (!isAllowedSender(email.from)) {
    console.log(`Rejected email from unauthorized sender: ${senderAddress(email.from)}`);
    await notifyOwnerOfRejectedEmail(email);
    return;
  }

  await agent.processEmail({
    from: email.from,
    subject: email.subject,
    body: email.text || email.html,
    thread,
  });
}
```

`InboxEmail` is the email returned by `resend.inboxes.threads.emails.get()`. The webhook payload carries the same fields without `html` and `text`. `agent` and `notifyOwnerOfRejectedEmail` stand for your own code.

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
  const payload = await req.text();

  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get('svix-id') ?? '',
        timestamp: req.headers.get('svix-timestamp') ?? '',
        signature: req.headers.get('svix-signature') ?? '',
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
    });
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  if (event.type === 'inbox.email.received') {
    const { inbox_id, thread_id, email_id } = event.data;

    // The webhook payload has no body. Fetch the email to read it.
    const { data: email, error } = await resend.inboxes.threads.emails.get({
      inboxId: inbox_id,
      threadId: thread_id,
      emailId: email_id,
    });

    if (error) {
      // A non-2xx response makes Resend retry the webhook later
      return new NextResponse('Error', { status: 500 });
    }

    // Apply the security level chosen above
    await processEmailForAgent(email, {
      inboxId: inbox_id,
      threadId: thread_id,
      emailId: email_id,
    });
  }

  return new NextResponse('OK', { status: 200 });
}
```

### Express

```javascript
import express from 'express';
import { Resend } from 'resend';

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_SENDERS = (process.env.ALLOWED_SENDERS || '')
  .split(',')
  .map((sender) => sender.trim().toLowerCase())
  .filter(Boolean);

const senderAddress = (from) => {
  const match = from.match(/<([^<>]+)>\s*$/);
  return (match ? match[1] : from).trim().toLowerCase();
};

const isAllowedSender = (from) => ALLOWED_SENDERS.includes(senderAddress(from));

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = resend.webhooks.verify({
      payload: req.body.toString(),
      headers: {
        id: req.headers['svix-id'],
        timestamp: req.headers['svix-timestamp'],
        signature: req.headers['svix-signature'],
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    });
  } catch {
    res.status(400).send('Invalid signature');
    return;
  }

  if (event.type === 'inbox.email.received') {
    const { inbox_id, thread_id, email_id, email } = event.data;

    // The payload already has the sender, so reject before fetching the body
    if (!email || !isAllowedSender(email.from)) {
      console.log(`Rejected email from unauthorized sender: ${email ? senderAddress(email.from) : 'unknown'}`);
      res.status(200).send('OK'); // Return 200 even for rejected emails
      return;
    }

    const { data: fullEmail, error } = await resend.inboxes.threads.emails.get({
      inboxId: inbox_id,
      threadId: thread_id,
      emailId: email_id,
    });

    if (error) {
      res.status(500).send('Error'); // Resend retries the webhook later
      return;
    }

    await processEmailForAgent(fullEmail, { inboxId: inbox_id, threadId: thread_id, emailId: email_id });
  }

  res.status(200).send('OK');
});

app.get('/', (req, res) => res.send('Agent Email Inbox - Ready'));
app.listen(3000, () => console.log('Webhook server running on :3000'));
```

Resend signs inbox webhooks with the same `svix-*` headers as every other webhook. `inbox.email.received` fires for email the inbox receives. The agent's own replies fire `inbox.email.sent` instead, so subscribe to `inbox.email.received` only.

For webhook registration via API, tunneling setup, svix fallback, and retry behavior, see [references/webhook-setup.md](references/webhook-setup.md).

## Replying from Your Agent

Reply inside the thread. Resend addresses the reply and sets the `In-Reply-To` and `References` headers, so the sender's mail client shows it in the same conversation:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function replyInThread(
  thread: { inboxId: string; threadId: string; emailId: string },
  body: string,
) {
  const { data, error } = await resend.inboxes.threads.emails.reply({
    inboxId: thread.inboxId,
    threadId: thread.threadId,
    emailId: thread.emailId,
    text: body,
  });

  if (error) throw new Error(`Failed to reply: ${error.message}`);
  return data.id;
}
```

The reply goes to the email's `Reply-To` addresses, or to its sender when it has none. **A sender on your allowlist can set `Reply-To` to any address**, so check `email.reply_to` against the allowlist too before the agent replies with anything sensitive. Leave `replyAll` off unless the agent should copy every recipient of the original email.

To start a new conversation, send from the inbox address with `resend.emails.send()`. For full sending docs, install the `resend` skill.

## Receiving without an Inbox

Use Resend Receiving directly when the user has no custom domain, or their plan has no inbox available. The security levels above apply unchanged. What differs:

- **Address:** use the auto-generated `<anything>@<your-id>.resend.app` address (Dashboard → Emails → Receiving → "Receiving address"), or a custom domain with receiving enabled. No inbox is created.
- **Webhook event:** subscribe to `email.received` instead of `inbox.email.received`. The payload has `email_id`, `from`, `to` and `subject`, but no body.
- **Reading the email:** fetch it with `resend.emails.receiving.get(emailId)`.
- **Replying:** send with `resend.emails.send()` and set the `In-Reply-To` header yourself. There are no threads.

```typescript
if (event.type === 'email.received') {
  if (!isAllowedSender(event.data.from)) {
    return new NextResponse('OK', { status: 200 });
  }

  const { data: email, error } = await resend.emails.receiving.get(event.data.email_id);
  if (error) {
    return new NextResponse('Error', { status: 500 });
  }

  await agent.processEmail({ from: email.from, subject: email.subject, body: email.text || email.html });
}
```

The webhook verification is the same as in the inbox examples.

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
| Old Resend SDK version | `resend.inboxes.*` needs `resend` >= 6.34.1. `emails.receiving.get()` and `webhooks.verify()` also need recent versions. See SDK Version Requirements |
| Comparing `from` as a whole string | `from` can be `Name <address>`. Extract the address before you compare it with the allowlist |
| Replying to `Reply-To` without checking it | A trusted sender can point `Reply-To` anywhere. Check it against the allowlist before a sensitive reply |
| Using a "Sending access" API key | It can only reply, forward, create drafts and send drafts. Inbox reads and webhook setup need a full access key |
| Passing `secret` or `svix-*` keys to `webhooks.verify()` | Pass `webhookSecret`, and `headers` as `{ id, timestamp, signature }` |

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

- For full sending, receiving and inbox docs, install the `resend` skill
