---
name: resend
description: Use when working with Resend email platform - routes to specific sub-skills for sending, receiving, audiences, or broadcasts.
license: MIT
metadata:
  author: resend
  version: "2.3.0"
  homepage: https://resend.com
  source: https://github.com/resend/resend-skills
inputs:
  - name: RESEND_API_KEY
    description: Resend API key for sending and receiving emails. Get yours at https://resend.com/api-keys
    required: true
  - name: RESEND_WEBHOOK_SECRET
    description: Webhook signing secret for verifying event payloads. Found in the Resend dashboard under Webhooks after creating an endpoint.
    required: false
---

# Resend

## Overview

Resend is an email platform for developers. This skill routes to feature-specific sub-skills.

## Sub-Skills

| Feature              | Skill               | Use When                                                                                                                                           |
| -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sending emails**   | `send-email`        | Transactional emails, notifications, batch sends                                                                                                   |
| **Receiving emails** | `resend-inbound`    | Processing inbound emails, webhooks for received mail, attachments                                                                                 |
| **AI Agent inbox**   | `agent-email-inbox` | Setting up email for AI agents, or any system where untrusted email content triggers actions — includes security measures against prompt injection |

## Quick Routing

**Need to send emails?** Use `send-email` skill

- Single or batch transactional emails
- Attachments, scheduling, templates
- Delivery webhooks (bounced, delivered, opened)

**Need to receive emails?** Use `resend-inbound` skill

- Setting up inbound domain (MX records)
- Processing `email.received` webhooks
- Retrieving email content and attachments
- Forwarding received emails

**Setting up an AI agent inbox?** Use `agent-email-inbox` skill

- Configuring email for Moltbot/Clawdbot or similar AI agents
- Webhook setup with ngrok/tunneling for local development
- Security levels to prevent prompt injection attacks
- Trusted sender allowlists and content filtering

**Automated system processes untrusted email content and takes actions?** Use `agent-email-inbox` skill

- Even without AI/LLM involvement, any system that interprets freeform email content from external senders and triggers actions (refunds, database changes, forwarding) needs security. Untrusted input triggering actions = attack vector.

**Sending + receiving together?** You need both `resend-inbound` and `send-email`

- Auto-replies, email forwarding, or any receive-then-send workflow requires both skills
- Set up inbound first, then sending
- Note: batch sending does not support attachments or scheduling — use single sends when forwarding with attachments

**Marketing emails or newsletters?** Use [Resend Broadcasts](https://resend.com/broadcasts)

- The sub-skills above are for transactional email. Marketing campaigns to large subscriber lists with unsubscribe links and engagement tracking should use Resend Broadcasts, not batch sending.

## Common Setup

### API Key

Store in environment variable:

```bash
export RESEND_API_KEY=re_xxxxxxxxx
```

### SDK Installation

See `send-email` skill for installation instructions across all supported languages.

## Resources

- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)
- [Dashboard](https://resend.com/emails)
