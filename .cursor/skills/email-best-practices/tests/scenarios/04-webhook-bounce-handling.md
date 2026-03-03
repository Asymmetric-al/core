# Scenario 4: Webhook Bounce/Complaint Handling

## Prompt

```
You are an AI coding assistant. A developer asks you:

"I need to set up Resend webhooks to handle bounces and complaints. Show me how to implement this with signature verification using svix, idempotent event processing, and proper bounce/complaint handling (when to suppress, when to retry). Include TypeScript code."

Be specific about: svix verification headers, hard vs soft bounce handling thresholds, and complaint handling requirements.
```

## Expected Correctness Criteria

### Webhook setup (webhooks-events.md)

- [ ] Endpoint must return 2xx within 5 seconds
- [ ] Return 200 immediately, process asynchronously

### Svix verification (webhooks-events.md)

- [ ] Import from 'svix'
- [ ] Headers: `svix-id`, `svix-timestamp`, `svix-signature`
- [ ] Verify before processing, return 400 on invalid signature

### Idempotent processing (webhooks-events.md)

- [ ] Use event ID to deduplicate
- [ ] Check if already processed before handling
- [ ] Mark as processed after handling

### Event types (webhooks-events.md)

- [ ] `email.sent`, `email.delivered`, `email.bounced`, `email.complained`, `email.opened`, `email.clicked`

### Bounce handling (webhooks-events.md + list-management.md)

- [ ] Hard bounce: suppress immediately, remove from all lists
- [ ] Soft bounce: track count, suppress after 3 failures
- [ ] Suppression entry schema includes: email, reason, created_at, source_email_id

### Complaint handling (webhooks-events.md + list-management.md)

- [ ] Immediate suppression — no exceptions
- [ ] Remove from all lists
- [ ] Log for analysis

### Suppression unsuppress rules (list-management.md)

- [ ] Hard bounce: cannot unsuppress (address invalid)
- [ ] Complaint: cannot unsuppress (legal requirement)
- [ ] Soft bounce (3x): can unsuppress after 30-90 days
- [ ] Manual removal: only if user requests

### Pre-send check (list-management.md)

- [ ] Always check suppression before sending

### Retry behavior (webhooks-events.md)

- [ ] Non-2xx triggers retries: ~30s -> ~1min -> ~5min (continues ~24 hours)
