# Usage

Account-level usage and quotas. A single snapshot endpoint — no ID, no pagination, no filters. Use it to check how close an account is to its plan limits for emails, contacts, segments, broadcasts, AI credits, automation runs, and domains, plus the account's API rate limit.

## SDK Methods

| Operation | Node.js | Python |
|-----------|---------|--------|
| Get | `resend.usage.get()` | `resend.Usage.get()` |

Method naming per SDK: Ruby `Resend::Usage.get`, Go `client.Usage.Get()`, PHP `$resend->usage->get()`, Java `resend.usage().get()`, .NET `resend.UsageAsync()`, Rust `resend.usage.get().await`.

## Get Usage

`GET /usage`

Takes no parameters.

### Node.js

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.usage.get();

if (error) {
  console.error(error);
  return;
}

console.log(`${data.emails.daily.used} emails today`);
console.log(`${data.contacts.used} / ${data.contacts.limit} contacts`);
```

### Python

```python
import resend
import os

resend.api_key = os.environ["RESEND_API_KEY"]

usage = resend.Usage.get()

print(f'{usage["emails"]["daily"]["used"]} emails today')
print(f'{usage["contacts"]["used"]} / {usage["contacts"]["limit"]} contacts')
```

### cURL

```bash
curl -s "https://api.resend.com/usage" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "User-Agent: curl"
```

### Response

```json
{
  "object": "usage",
  "emails": {
    "daily": { "used": 258, "limit": null, "sent": 57, "received": 201, "resets_at": "2026-07-17T00:00:00.000Z" },
    "monthly": { "used": 5442, "limit": 10000, "sent": 1000, "received": 4442, "resets_at": "2026-08-01T00:00:00.000Z" }
  },
  "contacts": { "used": 85000, "limit": 150000 },
  "segments": { "used": 2, "limit": 3 },
  "broadcasts": { "used": 100, "limit": null },
  "ai_credits": { "used": 0, "limit": 500, "next_increase_at": "2026-07-18T09:00:00.000Z" },
  "automation_runs": { "used": 0, "limit": 1000, "resets_at": "2026-08-01T00:00:00.000Z" },
  "domains": { "used": 1, "limit": 1000 },
  "rate_limit": { "limit": 10, "duration": "1000ms" }
}
```

## Response Fields

| Field | Type | Nullable | Description |
|-------|------|----------|--------------|
| `object` | string | No | Always `"usage"` |
| `emails.daily.used` | number | No | Emails sent + received in the current day (`sent` + `received`) |
| `emails.daily.limit` | number \| null | Yes | Plan's daily email cap. `null` when the plan has no daily cap (only a monthly one) |
| `emails.daily.sent` | number | No | Emails sent today |
| `emails.daily.received` | number | No | Emails received (inbound) today |
| `emails.daily.resets_at` | timestamp | No | When the daily counters next reset |
| `emails.monthly.used` | number | No | Emails sent + received in the current billing month |
| `emails.monthly.limit` | number | No | Plan's monthly email cap — always a number |
| `emails.monthly.sent` | number | No | Emails sent this month |
| `emails.monthly.received` | number | No | Emails received (inbound) this month |
| `emails.monthly.resets_at` | timestamp | No | When the monthly counters next reset |
| `contacts.used` | number | No | Total contacts on the account |
| `contacts.limit` | number | No | Plan's contact cap — always a number |
| `segments.used` | number | No | Segments created |
| `segments.limit` | number \| null | Yes | Plan's segment cap. `null` when the plan doesn't cap segments |
| `broadcasts.used` | number | No | Broadcasts sent |
| `broadcasts.limit` | null | Always null | Broadcasts have no plan cap — this field is always `null` |
| `ai_credits.used` | number | No | AI credits consumed in the current period |
| `ai_credits.limit` | number \| null | Yes | Plan's AI credit cap. `null` when the plan grants unlimited AI credits |
| `ai_credits.next_increase_at` | timestamp \| null | Yes | When credits are next scheduled to increase. `null` if no increase is scheduled |
| `automation_runs.used` | number | No | Automation runs in the current period |
| `automation_runs.limit` | number | No | Plan's automation run cap — always a number |
| `automation_runs.resets_at` | timestamp | No | When the automation run counter next resets |
| `domains.used` | number | No | Domains added to the account |
| `domains.limit` | number \| null | Yes | Plan's domain cap. `null` when the plan doesn't cap domains |
| `rate_limit.limit` | number | No | Max API requests allowed per `duration` window |
| `rate_limit.duration` | string | No | Length of the rate-limit window, e.g. `"1000ms"` |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Assuming every `limit` field can be `null` | Only `emails.daily.limit`, `segments.limit`, `ai_credits.limit`, and `domains.limit` can be `null`. `emails.monthly.limit`, `contacts.limit`, and `automation_runs.limit` are always numbers, and `broadcasts.limit` is always `null` |
| Reading `emails.daily.used` as "sent only" | `used` is `sent` + `received` combined — check `sent`/`received` separately for a breakdown |
| Expecting `ai_credits.next_increase_at` to always be set | It's `null` when no future increase is scheduled |
| Calling `.list()` or passing an ID | Usage is a single account-level snapshot — no list, get-by-id, create, update, or delete operations |
| Treating `rate_limit` as per-endpoint | It reflects the account's default API rate limit, not a per-endpoint override |
