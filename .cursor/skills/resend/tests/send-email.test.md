# Test: Send Email Skill

**Skill under test:** `send-email`
**Skill type:** Reference/Technique
**Test approach:** Application scenarios - can the agent correctly apply sending patterns, choose single vs batch, handle errors, and avoid common mistakes? Emphasis on Resend-specific behavior that differs from other email APIs.

## Setup

```
IMPORTANT: This is a real scenario. You must choose and act.
Write actual code, not pseudocode. Use the send-email skill as your reference.
```

---

## Scenario 1: Single vs Batch Decision

**Tests:** Correct selection of endpoint based on requirements

```
You're building a Node.js service. Implement email sending for these cases:

Case A: User resets their password - send a reset link email with a PDF attachment of their account activity.
Case B: 75 users just completed onboarding - send each a personalized welcome email.
Case C: Send a single order confirmation to a customer, scheduled for 9am tomorrow.
Case D: Send 2 emails - one receipt with a PDF attachment, one shipping notification without attachments. Both to the same customer.

For each case, state which endpoint you'd use (single or batch) and why.
```

**Expected:**

- Case A: **Single** - has attachment (batch doesn't support attachments)
- Case B: **Batch** - multiple distinct emails, no attachments, under 100 limit
- Case C: **Single** - needs scheduling (batch doesn't support scheduling)
- Case D: **2 single sends** (or 1 single + 1 single) - can't batch because one has an attachment. Cannot mix attachment and non-attachment emails in a batch.

**Failure indicators:**

- Uses batch for Case A (attachments not supported)
- Uses single sends in a loop for Case B (should use batch)
- Uses batch for Case C (scheduling not supported)
- Puts both Case D emails in a batch (attachment email can't be batched)

---

## Scenario 2: Idempotency Key Implementation

**Tests:** Correct idempotency key usage

```
Write a Node.js function that sends a welcome email to a new user.
The function may be called multiple times due to retry logic in your queue.
User ID: usr_abc123. Include proper idempotency handling.
```

**Expected:**

- Idempotency key based on event type + entity ID: `welcome-email/usr_abc123`
- Key passed as second argument to `resend.emails.send()`
- Agent understands keys expire after 24 hours

**Failure indicators:**

- No idempotency key at all
- Random/UUID-based key (defeats deduplication purpose)
- Key doesn't include user ID (can't deduplicate per-user)
- Key passed inside the email payload instead of as options

---

## Scenario 3: Idempotency 409 Conflict

**Tests:** Understanding what happens when same key is used with different payload

```
You sent a welcome email with idempotency key "welcome-email/usr_abc123".
Now marketing wants to A/B test: send the SAME user a slightly different
welcome email (different subject line) using the same key.

What happens? What do you do?
```

**Expected:**

- Same key + different payload = **409 error** (idempotency conflict)
- Must use a **new key** for the variant (e.g., `welcome-email-v2/usr_abc123`)
- Keys expire after 24 hours, so the original key will eventually free up, but you shouldn't wait

**Failure indicators:**

- Says it will just work / overwrite the first email
- Doesn't know about the 409 behavior
- Suggests waiting 24 hours for key expiry as the solution

---

## Scenario 4: Error Handling + SDK Response Shape

**Tests:** Correct retry behavior AND understanding of Resend Node.js SDK response pattern

```
Write error handling for your Node.js email service. A teammate wrote this:

try {
  const result = await resend.emails.send({
    from: 'Acme <hi@acme.com>',
    to: ['user@example.com'],
    subject: 'Hello',
    html: '<p>Hi</p>',
  });
  console.log('Sent:', result.id);
} catch (error) {
  // Retry on failure
  await retry();
}

What's wrong with this code? Fix it and add proper error handling for
422 validation errors, 429 rate limits, and 500 server errors.
```

**Expected:**

- The Resend Node.js SDK does NOT throw exceptions -- it returns `{ data, error }`. The try/catch won't catch API errors.
- Fixed code should destructure `{ data, error }` and check `error` explicitly
- 422: Fix request, do NOT retry
- 429/500: Retry with exponential backoff (1s, 2s, 4s...)
- Max 3-5 retries, always with idempotency keys

**Failure indicators:**

- Doesn't notice the try/catch problem (this is a Resend-specific gotcha)
- Keeps the try/catch pattern for API error handling
- Retries 422 errors
- No exponential backoff

---

## Scenario 5: Large Batch Chunking

**Tests:** Handling sends larger than 100

```
You need to send personalized shipping notifications to 350 customers.
Each email has the same structure but different recipient and tracking info.
Write the implementation in Node.js.
```

**Expected:**

- Chunks into batches of 100 (100, 100, 100, 50)
- Unique idempotency key per chunk: `batch-shipping/chunk-0`, `batch-shipping/chunk-1`, etc.
- Parallel sending of chunks for throughput
- Per-chunk error tracking for partial failure handling

**Failure indicators:**

- Tries to send all 350 in one batch call
- Sends 350 individual single emails
- No chunking logic
- Same idempotency key for all chunks
- No error handling per chunk

---

## Scenario 6: Domain Warm-up Trap

**Tests:** Knowledge of warm-up schedule for new domains

```
You just verified a brand-new domain (registered yesterday) on Resend.
Your app just launched and 5,000 users signed up on day one. You need
to send each a welcome email.

What's wrong with sending all 5,000 today? What should you do instead?
```

**Expected:**

- New domains must warm up gradually -- sending 5,000 on day 1 triggers spam filters
- New domain schedule: max ~150 emails on day 1
- Should spread sends over the warm-up period (roughly 7 days to reach full volume)
- Monitor bounce rate (< 4%) and spam complaint rate (< 0.08%)

**Failure indicators:**

- Sends all 5,000 immediately with no mention of warm-up
- Knows about warm-up but cites wrong limits (existing domain limits are higher)
- Doesn't distinguish between new and existing domain warm-up schedules

---

## Scenario 7: Testing Safety

**Tests:** Agent avoids testing with fake real-provider addresses

```
IMPORTANT: This is a real scenario. Choose and act.

You're building a demo for your manager. The demo is in 30 minutes.
You need to test that emails send correctly. Your RESEND_API_KEY is set up.

You want to quickly verify the integration works. What email address(es)
do you send test emails to?

Options:
A) test@gmail.com - quick and easy
B) delivered@resend.dev - Resend's test address
C) your-manager@company.com - they'll see it works in real-time
D) fake-user-123@outlook.com - won't matter, it's just a test
```

**Expected:** B. Uses `delivered@resend.dev` for safe testing.

**Failure indicators:**

- Chooses A or D (fake addresses at real providers = bounces = reputation damage)
- Chooses C without also testing with resend.dev first
- Doesn't explain WHY A/D are dangerous

---

## Scenario 8: Tracking Is Domain-Level

**Tests:** Understanding that tracking configuration is NOT per-email

```
You're sending two types of emails from the same domain (acme.com):
- Password resets (transactional - tracking should be OFF)
- Marketing newsletters (tracking should be ON)

How do you configure click tracking to be enabled for newsletters
but disabled for password resets?
```

**Expected:**

- Tracking (open/click) is configured at the **domain level** in the Resend dashboard, NOT per-email in the API
- You CANNOT set `tracking: false` per email in the API call
- Solution: use **separate subdomains** -- e.g., `notifications.acme.com` (tracking off) for transactional, `mail.acme.com` (tracking on) for marketing

**Failure indicators:**

- Tries to pass a tracking parameter in the API call (doesn't exist)
- Doesn't know tracking is domain-level
- Suggests a workaround within a single domain

---

## Scenario 9: Suppression List Behavior

**Tests:** Understanding what happens when sending to a previously bounced address

```
A user signed up with typo@gmial.com (typo). The first welcome email
hard bounced. The user contacts support, fixes their email to
typo@gmail.com, and asks you to resend the welcome email. But they
also want you to try typo@gmial.com again "just in case."

What happens when you try to send to typo@gmial.com again?
```

**Expected:**

- Resend automatically adds hard-bounced addresses to a **suppression list**
- Sending to typo@gmial.com will be silently suppressed -- Resend won't attempt delivery
- The `email.suppressed` webhook event fires instead
- The suppression list protects sender reputation automatically
- To resend: use the correct address (typo@gmail.com), and the suppressed address can be managed in the dashboard

**Failure indicators:**

- Says it will bounce again (partially correct but misses suppression)
- Doesn't know about automatic suppression list
- Doesn't mention the `email.suppressed` webhook event
- Suggests the email will be delivered normally

---

## Scenario 10: Template Variable Gotcha + Mutual Exclusivity

**Tests:** Case-sensitivity and parameter conflicts

```
You're using a Resend template (ID: tmpl_order_confirm) with variables
USER_NAME, ORDER_TOTAL, DELIVERY_DATE defined in the editor.

A teammate wrote this code. Find all the bugs:

const { data, error } = await resend.emails.send({
  from: 'Acme <orders@acme.com>',
  to: ['customer@example.com'],
  subject: 'Order Confirmation',
  html: '<p>Fallback content</p>',
  template: {
    id: 'tmpl_order_confirm',
    variables: {
      user_name: 'Alice',
      order_total: '$99',
      delivery_date: 'Feb 15',
    },
  },
});
```

**Expected bugs found:**

1. **Variable names are wrong case**: `user_name` should be `USER_NAME`, `order_total` → `ORDER_TOTAL`, `delivery_date` → `DELIVERY_DATE` (case-sensitive)
2. **`html` and `template` are mutually exclusive**: Can't use both -- remove the `html` parameter
3. **No idempotency key**: Missing from the send call

**Failure indicators:**

- Misses the case-sensitivity issue
- Misses the html+template mutual exclusivity
- Only finds one of the three bugs

---

## Scenario 11: Batch Pre-validation

**Tests:** Understanding atomic batch failure

```
You have an array of 50 email objects to send in a batch. One of them
has a missing `subject` field. What happens if you send this batch?
What should you do before sending?
```

**Expected:**

- The ENTIRE batch fails (atomic - one invalid email = all fail)
- Must validate all emails before sending: check required fields (from, to, subject, html/text), validate email formats, ensure batch size <= 100

**Failure indicators:**

- Says only the invalid email fails (wrong - batch is atomic)
- Doesn't mention pre-validation
- Doesn't list the specific fields to validate

---

## Scoring

| Scenario                  | Pass Criteria                                            |
| ------------------------- | -------------------------------------------------------- |
| 1 - Single vs Batch       | All 4 cases correct with reasoning                       |
| 2 - Idempotency           | Semantic key format, correct API usage                   |
| 3 - 409 Conflict          | Knows different payload = 409, needs new key             |
| 4 - Error + SDK Shape     | Catches try/catch bug, correct retry logic               |
| 5 - Large Batch           | Chunking at 100, unique keys per chunk, parallel sends   |
| 6 - Domain Warm-up        | Knows new domain limits, cites correct day-1 cap         |
| 7 - Testing Safety        | Chooses resend.dev, explains danger of real providers    |
| 8 - Tracking Domain-Level | Knows it's not per-email, suggests subdomains            |
| 9 - Suppression List      | Knows about auto-suppression and webhook event           |
| 10 - Template Bugs        | Finds all 3 bugs (case, mutual exclusivity, idempotency) |
| 11 - Batch Validation     | Understands atomic failure, validates before send        |

**Pass threshold:** 9/11 scenarios correct
