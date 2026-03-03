# Test: Resend Router Skill

**Skill under test:** `resend` (root router)
**Skill type:** Reference (router)
**Test approach:** Retrieval scenarios - does the agent route to the correct sub-skill?

## Setup

```
IMPORTANT: This is a real scenario. You must choose and act.
You have access to: resend skill (router)
```

---

## Scenario 1: Ambiguous Send vs Receive

**Tests:** Correct routing when the request involves both sending and receiving

```
A user asks: "I need to set up a system where customers email support@acme.com
and get an automatic reply acknowledging their message."

Which sub-skill(s) do you need? What's the correct order of setup?
```

**Expected:** Agent identifies BOTH `resend-inbound` (to receive emails) AND `send-email` (to send auto-reply). Should set up inbound first, then sending.

**Failure indicators:**

- Routes only to `send-email`
- Routes only to `resend-inbound`
- Doesn't mention order of operations

---

## Scenario 2: Automation That Sounds Like AI

**Tests:** Distinguishing `resend-inbound` from `agent-email-inbox` when the request describes automation without saying "AI"

```
A user says: "I want to build a system that receives customer emails,
automatically extracts invoice numbers from the body, looks up the order
in our database, and updates the status. It should also auto-reply with
the current order status."

Which sub-skill do you route to?
```

**Expected:** This is ambiguous. The system "understands" email content and "takes actions" -- but it could be rule-based parsing (regex for invoice numbers) or AI-driven. Agent should either:

- Ask whether this is rule-based or AI-driven processing
- Route to `agent-email-inbox` if they assume AI (because of "automatically extracts" / "understands"), mentioning security
- Route to `resend-inbound` if they assume simple parsing, but flag that if AI is involved, security measures are needed

**Failure indicators:**

- Routes confidently to one skill without acknowledging the ambiguity
- Routes to `resend-inbound` with no mention of security implications if AI is involved
- Routes to `agent-email-inbox` for what might be simple regex parsing

---

## Scenario 3: Domain Setup Ambiguity

**Tests:** Routing when "domain" could mean sending domain or receiving domain

```
A user says: "I need to configure my domain for Resend."

How do you handle this?
```

**Expected:** Agent should clarify because "configure domain" means different things:

- Sending domain: DNS records (SPF, DKIM, DMARC) for email authentication → `send-email` skill
- Receiving domain: MX records for inbound email → `resend-inbound` skill
- Both: common for apps that send and receive

**Failure indicators:**

- Assumes sending or receiving without asking
- Routes to a single sub-skill without clarifying
- Doesn't know that domain setup differs between sending and receiving

---

## Scenario 4: Webhook Setup Confusion

**Tests:** Routing when user mentions webhooks (both sending and receiving use them)

```
A user says: "I need to set up webhooks for Resend."

How do you clarify what they need?
```

**Expected:** Agent should clarify the use case because webhooks appear in multiple sub-skills:

- `send-email` → delivery status webhooks (`email.delivered`, `email.bounced`)
- `resend-inbound` → received email webhooks (`email.received`)
- `agent-email-inbox` → received email webhooks with security layer

**Failure indicators:**

- Assumes one type of webhook without asking
- Routes to a single sub-skill without clarifying

---

## Scenario 5: Forwarding Trap

**Tests:** Recognizing that "forwarding" requires both receiving and sending

```
A user says: "When someone emails helpdesk@myapp.com, I want to forward
it to our team Slack channel and also forward it as an email to
manager@company.com with any attachments."

Which sub-skill(s) do you need?
```

**Expected:** Both `resend-inbound` (to receive the email) and `send-email` (to forward as email with attachments). The Slack part is outside Resend scope. Key detail: forwarding with attachments requires single sends (batch doesn't support attachments).

**Failure indicators:**

- Only routes to `send-email` (misses that you need to receive first)
- Only routes to `resend-inbound` (misses that email forwarding uses the send API)
- Doesn't note that attachments require single sends

---

## Scenario 6: Security Without AI Keywords

**Tests:** Recognizing security risk when "AI" is never mentioned but the system processes untrusted input and takes actions

```
A user says: "Customers will email returns@shop.com and my system will
automatically process refunds based on what they write. If they include
an order number and say they want a refund, it initiates the refund in
our payment system."

Which sub-skill do you route to?
```

**Expected:** This should route to `agent-email-inbox` (or at minimum flag security concerns) because:

- Untrusted external senders are triggering financial actions (refunds)
- The system interprets freeform email content to make decisions
- Without security, anyone could email "refund order #X" and trigger unauthorized refunds
- This is an attack vector whether or not AI is involved

**Failure indicators:**

- Routes to `resend-inbound` without mentioning security risks
- Treats this as simple email receiving + database lookup
- Doesn't flag that untrusted input triggering financial actions needs security

---

## Scenario 7: Broadcast / Audience Red Herring

**Tests:** Handling a request the router doesn't clearly cover

```
A user says: "I want to send a monthly newsletter to my 10,000 subscribers
with unsubscribe links and engagement tracking."

Which sub-skill do you route to?
```

**Expected:** The router skill mentions "audiences, or broadcasts" in its description but has no sub-skill listed for this use case. Agent should note that this is a marketing/broadcast use case, not covered by the current sub-skills (which focus on transactional sending and receiving). May mention Resend Broadcasts as the appropriate feature.

**Failure indicators:**

- Routes to `send-email` without caveats (send-email is for transactional, not marketing)
- Suggests batch sending 10,000 emails (wrong approach for newsletters)
- Doesn't mention that marketing emails have different requirements (unsubscribe, engagement tracking)

---

## Scenario 8: "Just Send an Email"

**Tests:** Simple routing baseline (control scenario)

```
A user says: "I need to send a welcome email when a user signs up."
```

**Expected:** Routes directly to `send-email`. Single transactional email, straightforward case.

**Failure indicators:**

- Over-routes to multiple skills
- Suggests batch when single is appropriate
- Suggests agent-email-inbox

---

## Scoring

| Scenario             | Pass Criteria                                               |
| -------------------- | ----------------------------------------------------------- |
| 1 - Ambiguous        | Routes to BOTH correct sub-skills in correct order          |
| 2 - Automation vs AI | Acknowledges ambiguity, asks or flags security if AI-driven |
| 3 - Domain Setup     | Clarifies sending vs receiving domain before routing        |
| 4 - Webhooks         | Clarifies use case before routing                           |
| 5 - Forwarding       | Routes to BOTH skills, notes attachment constraint          |
| 6 - Security no AI   | Flags security risk for untrusted input triggering actions  |
| 7 - Broadcast        | Notes this isn't covered by transactional sub-skills        |
| 8 - Simple send      | Routes to `send-email` directly                             |

**Pass threshold:** 6/8 correct routing decisions
