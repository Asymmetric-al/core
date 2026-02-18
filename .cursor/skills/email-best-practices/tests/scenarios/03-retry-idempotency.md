# Scenario 3: Retry Logic + Idempotency

## Prompt

```
You are an AI coding assistant. A developer asks you:

"I'm using the Resend API to send transactional emails. I need to implement retry logic with idempotency to prevent duplicate sends. Show me a TypeScript implementation with idempotency keys, exponential backoff, and proper error code handling."

Include specific HTTP error codes and which ones to retry vs not retry, idempotency key generation strategies, and backoff timing.
```

## Expected Correctness Criteria

### Idempotency keys (sending-reliability.md)

- [ ] Event-based key example: `order-confirm-${orderId}` (recommended)
- [ ] Request-scoped example: `reset-${userId}-${resetRequestId}`
- [ ] UUID fallback: `crypto.randomUUID()` — generate once, reuse on retry
- [ ] Warns against `Date.now()` or random values generated fresh on each attempt
- [ ] Key expiration: 24 hours — complete retry logic within this window

### Error codes (sending-reliability.md)

- [ ] Retry: 5xx (server error), 429 (rate limit), network timeout, DNS failure
- [ ] Do NOT retry: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 422 (validation)

### Backoff (sending-reliability.md)

- [ ] Exponential: 1s -> 2s -> 4s -> 8s
- [ ] Cap at 30 seconds
- [ ] Jitter to prevent thundering herd
- [ ] Max retries: 3

### Timeout (sending-reliability.md)

- [ ] AbortController pattern with 10-30 second timeout

### Queuing (sending-reliability.md)

- [ ] Queue pattern for critical emails: write pending -> attempt send -> mark sent/schedule retry -> mark failed + alert
