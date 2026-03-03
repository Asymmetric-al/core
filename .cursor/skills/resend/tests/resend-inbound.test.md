# Test: Resend Inbound Skill

**Skill under test:** `resend-inbound`
**Skill type:** Reference/Technique
**Test approach:** Application scenarios - can the agent correctly set up inbound email, handle webhooks, retrieve content, and avoid common mistakes? Emphasis on Resend-specific behavior that differs from other email webhook services.

## Setup

```
IMPORTANT: This is a real scenario. You must choose and act.
Write actual code, not pseudocode. Use the resend-inbound skill as your reference.
```

---

## Scenario 1: Webhook Payload Understanding

**Tests:** Agent knows webhooks contain metadata only, not email body

```
You receive this webhook payload from Resend:

{
  "type": "email.received",
  "created_at": "2024-02-22T23:41:12.126Z",
  "data": {
    "email_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "from": "customer@example.com",
    "to": ["support@acme.com"],
    "subject": "I need help with my order",
    "attachments": [
      {
        "id": "att_receipt123",
        "filename": "receipt.pdf",
        "content_type": "application/pdf"
      }
    ]
  }
}

Write the handler to extract the email body text and download the attachment.
```

**Expected:**

- Does NOT try to read body from webhook payload (it's not there)
- Calls `resend.emails.receiving.get(event.data.email_id)` for body
- Calls `resend.emails.receiving.attachments.list()` for attachment URLs
- Downloads attachment via `fetch(attachment.download_url)`
- Notes that download_url expires after 1 hour

**Failure indicators:**

- Tries to access `event.data.body` or `event.data.html` (doesn't exist)
- Skips the separate API call for email content
- Doesn't handle attachment download URL expiration

---

## Scenario 2: Domain Setup - Existing Email Provider

**Tests:** Subdomain recommendation when root domain has existing MX records

```
Your company uses Google Workspace for email at acme.com. All employees
have @acme.com addresses. You want Resend to receive emails at
support addresses for your app.

How do you configure the domain?
```

**Expected:**

- Recommends a **subdomain** (e.g., `support.acme.com` or `inbound.acme.com`)
- Explains that setting MX on root domain would break Google Workspace
- MX record with priority 10 pointing to Resend's value
- Shows example: `support.acme.com. MX 10 <resend-mx-value>`

**Failure indicators:**

- Suggests adding MX record to root domain `acme.com` (breaks existing email)
- Doesn't mention the risk to existing email service
- Doesn't explain MX priority

---

## Scenario 3: Webhook Signature Verification

**Tests:** Agent always includes webhook verification

```
Write a Next.js API route that handles the email.received webhook from Resend.
Keep it minimal but production-ready.
```

**Expected:**

- Reads body as raw text (`req.text()`), NOT parsed JSON
- Verifies webhook signature using `resend.webhooks.verify()`
- Extracts svix-id, svix-timestamp, svix-signature headers
- Uses `RESEND_WEBHOOK_SECRET` for verification
- Returns 200 OK on success
- Returns 400 on verification failure

**Failure indicators:**

- Parses JSON directly without signature verification
- Uses `req.json()` before verification (needs raw text)
- Skips verification "for simplicity"
- Doesn't use the svix headers
- Doesn't return appropriate status codes

---

## Scenario 4: Attachment Expiration Edge Case

**Tests:** Understanding download URL expiration behavior

```
Your webhook handler receives an email with 3 large attachments. To avoid
blocking the webhook response, you store the email_id and attachment
download_urls in a job queue. A background worker picks up the job
90 minutes later and tries to download the attachments. All downloads fail.

What went wrong? How do you fix your architecture?
```

**Expected:**

- `download_url` expires after **1 hour** -- 90 minutes later, all URLs are invalid
- Fix: Store only the `email_id` in the queue, NOT the download URLs
- The background worker should call `resend.emails.receiving.attachments.list()` at processing time to get fresh URLs
- Alternative: download attachments immediately in the webhook handler and store the content

**Failure indicators:**

- Doesn't know about the 1-hour expiration
- Suggests caching URLs is fine
- Doesn't provide a fix for the architecture

---

## Scenario 5: Email Forwarding with Attachments

**Tests:** Complete forwarding flow including attachment re-encoding

```
Build a Node.js email forwarding handler: when an email arrives at
support@acme.com, forward it to team@acme.com with all attachments intact.
```

**Expected flow:**

1. Verify webhook signature
2. Get email content via `resend.emails.receiving.get()`
3. List attachments via `resend.emails.receiving.attachments.list()`
4. Download each attachment via `fetch(download_url)`
5. Convert to base64 for re-sending
6. Forward via `resend.emails.send()` with attachments array (NOT batch -- batch doesn't support attachments)

**Failure indicators:**

- Skips webhook verification
- Tries to forward attachments without downloading them first
- Doesn't convert attachment content to base64
- Doesn't handle the case where there are no attachments
- Uses batch send (batch doesn't support attachments)

---

## Scenario 6: MX Priority Conflict

**Tests:** Understanding MX priority when multiple records exist

```
Your domain has these MX records:

acme.com  MX  10  aspmx.l.google.com
acme.com  MX  20  inbound.resend.com

You added Resend's MX record but emails aren't arriving at Resend.
They all go to Google Workspace. What's wrong? How do you fix it?
```

**Expected:**

- The lowest priority NUMBER wins (10 < 20), so Google's MX takes all traffic
- Resend's MX needs to have the lowest number to take precedence
- But: changing the root domain MX will break Google Workspace for employees
- The real fix: use a **subdomain** for Resend inbound, not the root domain
- Example: `support.acme.com MX 10 inbound.resend.com`

**Failure indicators:**

- Suggests changing Resend's priority to 5 on root domain (breaks Google)
- Doesn't understand lowest number = highest priority
- Doesn't recommend a subdomain as the solution

---

## Scenario 7: Routing by Recipient - Edge Cases

**Tests:** Handling multiple recipients and CC edge cases

```
Your domain receives emails at support@, billing@, and feedback@ addresses.
All arrive at the same webhook. Consider these cases:

Case A: Email sent TO support@inbound.acme.com -- straightforward
Case B: Email sent TO billing@inbound.acme.com AND CC'd to support@inbound.acme.com
Case C: Email sent TO unknown-address@inbound.acme.com

Write the routing logic handling all cases.
```

**Expected:**

- Routes based on `event.data.to` array (may have multiple entries)
- Case B: both `to` and `cc` addresses are your domain -- decide which takes priority or handle both
- Case C: must have a catch-all for unknown recipients
- All arrive at same webhook (Resend doesn't support per-address routing)

**Failure indicators:**

- Only checks `to[0]` and ignores CC
- Doesn't handle multiple recipients in `to`
- No catch-all for unknown addresses
- Tries to set up separate webhooks per address

---

## Scenario 8: Webhook Idempotency

**Tests:** Handling duplicate webhook deliveries

```
Your webhook handler successfully processes an email, creates a support
ticket, and returns 200. But due to a network timeout, Resend doesn't
receive the 200 response and retries delivery. Your handler processes
the same email again, creating a duplicate support ticket.

How do you prevent this?
```

**Expected:**

- Use `event.data.email_id` as an idempotency check
- Before processing, check if you've already handled this email_id (in database, cache, or similar)
- Store processed email_ids and skip duplicates
- This is a standard webhook idempotency pattern

**Failure indicators:**

- Doesn't recognize the duplicate delivery problem
- Suggests only returning 200 faster (doesn't prevent all cases)
- No mention of tracking processed email_ids

---

## Scenario 9: Quick Start Domain Choice

**Tests:** Recommending the right domain option for the situation

```
You're a developer who just wants to test receiving emails with Resend
as quickly as possible. No DNS access, no custom domain yet.
What's the fastest path?
```

**Expected:**

- Use Resend's `.resend.app` managed domain
- No DNS configuration needed
- Auto-generated address: `<anything>@<your-id>.resend.app`
- Find address in Dashboard -> Emails -> Receiving -> "Receiving address"

**Failure indicators:**

- Immediately suggests custom domain setup with MX records
- Doesn't mention the `.resend.app` option
- Makes it sound like DNS setup is required

---

## Scoring

| Scenario                   | Pass Criteria                                                     |
| -------------------------- | ----------------------------------------------------------------- |
| 1 - Webhook Payload        | Knows body isn't in webhook, calls separate API                   |
| 2 - Domain Setup           | Recommends subdomain, explains root domain risk                   |
| 3 - Signature Verification | Raw text body, full svix verification, correct status codes       |
| 4 - Attachment Expiration  | Knows 1-hour limit, fixes architecture to fetch fresh URLs        |
| 5 - Forwarding             | Complete flow: verify -> get -> download -> base64 -> single send |
| 6 - MX Priority            | Understands priority numbers, recommends subdomain                |
| 7 - Routing Edge Cases     | Handles CC, multiple to, unknown recipients                       |
| 8 - Webhook Idempotency    | Uses email_id for dedup, tracks processed emails                  |
| 9 - Quick Start            | Recommends .resend.app domain for fastest path                    |

**Pass threshold:** 7/9 scenarios correct
