# Email Management

## Overview

After sending, emails can be retrieved, listed, rescheduled, cancelled, or shared. Updates are limited to `scheduled_at` only — content cannot be changed after creation.

## SDK Methods

### Node.js

| Operation | Method | Notes |
|-----------|--------|-------|
| Get | `resend.emails.get(id)` | Returns full email details and status |
| List | `resend.emails.list({ limit, offset })` | Paginated list of sent emails |
| Update | `resend.emails.update({ id, scheduledAt })` | Reschedule only — no content changes |
| Cancel | `resend.emails.cancel(id)` | Cancel a scheduled email before it sends |
| Share | `resend.emails.share(id, { expiresIn })` | Create a public link for a sent or received email; `expiresIn` defaults to and caps at 48h |

### Python

| Operation | Method |
|-----------|--------|
| Get | `resend.Emails.get(id)` |
| List | `resend.Emails.list(params)` |
| Update | `resend.Emails.update(params)` — params: `{ "id": ..., "scheduled_at": ... }` |
| Cancel | `resend.Emails.cancel(id)` |
| Share | `resend.Emails.share(email_id, params)` — params: `{ "expires_in": ... }` |

## Examples

### Get Email

```typescript
// Node.js — always destructure { data, error }
const { data, error } = await resend.emails.get('email_abc123');
if (error) {
  console.error(error);
  return;
}
console.log(data.status); // 'delivered', 'bounced', 'scheduled', etc.
```

```python
# Python — returns data directly
email = resend.Emails.get("email_abc123")
print(email["status"])
```

### Reschedule a Scheduled Email

```typescript
const { data, error } = await resend.emails.update({
  id: 'email_abc123',
  scheduledAt: '2026-04-01T09:00:00Z',
});
if (error) console.error(error);
```

```python
resend.Emails.update({
    "id": "email_abc123",
    "scheduled_at": "2026-04-01T09:00:00Z",
})
```

### Cancel a Scheduled Email

```typescript
const { data, error } = await resend.emails.cancel('email_abc123');
if (error) console.error(error);
```

```python
resend.Emails.cancel("email_abc123")
```

### Share a Sent or Received Email

Creates a public, unauthenticated link — anyone with the URL can view the email. Works for both sent and received emails; the API detects which type the ID belongs to.

```typescript
const { data, error } = await resend.emails.share('email_abc123', {
  expiresIn: '2 hours', // optional — human-readable duration, defaults to and caps at 48h
});
if (error) {
  console.error(error);
} else {
  console.log(data.url);
}
```

```python
shared = resend.Emails.share("email_abc123", {"expires_in": "2 hours"})
print(shared["url"])
```

## Retrieving Attachments

List and download attachments for sent emails. Returns metadata and a signed download URL.

### SDK Methods

| Operation | Node.js | Python |
|-----------|---------|--------|
| List | `resend.emails.attachments.list({ emailId })` | `resend.Emails.Attachments.list(email_id)` |
| Get | `resend.emails.attachments.get({ emailId, id })` | `resend.Emails.Attachments.get(email_id, attachment_id)` |

### Examples

```typescript
// List all attachments for a sent email
const { data: attachments, error } = await resend.emails.attachments.list({
  emailId: 'email_abc123',
});

if (error) {
  console.error(error);
  return;
}

for (const att of attachments.data) {
  console.log(att.filename);      // 'invoice.pdf'
  console.log(att.content_type);   // 'application/pdf'
  console.log(att.size);           // bytes
  console.log(att.download_url);   // signed URL, expires at att.expires_at
}

// Get a single attachment
const { data: attachment, error: getError } = await resend.emails.attachments.get({
  emailId: 'email_abc123',
  id: 'att_def456',
});

if (getError) {
  console.error(getError);
  return;
}

// Download the content
const response = await fetch(attachment.download_url);
const buffer = await response.arrayBuffer();
```

**Important:** `download_url` expires (see `expires_at` field). Call the API again for a fresh URL if needed.

### Attachment Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Attachment ID |
| `filename` | string | Original filename |
| `content_type` | string | MIME type |
| `content_id` | string | Content ID for inline attachments |
| `content_disposition` | `"inline"` \| `"attachment"` | Display mode |
| `download_url` | string | Signed download URL |
| `expires_at` | string | When the download URL expires |
| `size` | number | Size in bytes |

## Retrieving Metrics

Account-level email delivery and engagement metrics (sent, delivered, bounced, opened, clicked, etc.) for a date range. With no options, returns totals only. Optionally broken down by one or more dimensions: `period`, `domain`, `email`, `broadcast`.

`email` and `broadcast` are mutually exclusive — as dimensions, and as filters (`emailId`/`broadcastId`). Requesting both, in either form, is rejected.

### SDK Methods

| Operation | Node.js | Python |
|-----------|---------|--------|
| Get metrics | `resend.emails.metrics(options)` | `resend.Emails.metrics(params)` |

`options`/`params` (all optional):

| Field (Node.js / Python) | Type | Notes |
|-------|------|-------|
| `startDate` / `start_date` | string | ISO 8601 date or datetime. Defaults to 6 days before `endDate` |
| `endDate` / `end_date` | string | ISO 8601 date or datetime. Defaults to now |
| `timezone` | string | IANA timezone, e.g. `America/New_York`. Defaults to UTC |
| `granularity` | string | `hourly`, `daily`, `weekly`, or `monthly` — bucket size when `period` is a dimension. Defaults to `daily` |
| `metrics` | string[] | Which metrics to include. Defaults to all |
| `dimensions` | string[] | `period`, `domain`, `email`, `broadcast` — combinable except `email`+`broadcast` |
| `domainId` / `domain_id` | string[] | Restrict to these sending domain IDs (max 100) |
| `emailId` / `email_id` | string[] | Restrict to these email IDs (max 100). Cannot combine with `broadcast` dimension/`broadcastId` |
| `broadcastId` / `broadcast_id` | string[] | Restrict to these broadcast IDs (max 100). Cannot combine with `email` dimension/`emailId` |

### Examples

```typescript
// Totals only, default 6-day window
const { data, error } = await resend.emails.metrics();
if (error) {
  console.error(error);
  return;
}
console.log(data.totals.sent, data.totals.delivered);
```

```python
# Totals only, default 6-day window
metrics = resend.Emails.metrics({})
print(metrics["totals"]["sent"], metrics["totals"]["delivered"])
```

```typescript
// Broken down by period and broadcast, filtered to one broadcast
const { data, error } = await resend.emails.metrics({
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  dimensions: ['period', 'broadcast'],
  broadcastId: ['bc_abc123'],
});
if (error) console.error(error);

for (const row of data.data ?? []) {
  console.log(row.period, row.broadcast_name, row.delivered);
}
```

```python
metrics = resend.Emails.metrics({
    "start_date": "2026-07-01",
    "end_date": "2026-07-08",
    "dimensions": ["period", "broadcast"],
    "broadcast_id": ["bc_abc123"],
})

for row in metrics.get("data", []):
    print(row["period"], row["broadcast_name"], row["delivered"])
```

### Metrics Response Fields

| Field | Type | Description |
|-------|------|--------------|
| `totals` | object | Metric totals for the whole date range, keyed by metric name |
| `data` | array \| absent | Per-dimension breakdown rows. Absent when no `dimensions` were requested |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Trying to update `subject`, `html`, or `to` | Only `scheduledAt` can be updated — cancel and resend for content changes |
| Cancelling an already-sent email | Cancel only works on emails with `scheduled` status |
| Cancelling too late | Cancel before the `scheduled_at` time — there's a brief processing window before send |
| Not checking `error` in Node.js | SDK returns `{ data, error }`, does not throw — always destructure and check |
| Using `.list()` without pagination | Pass `limit` and `offset` to paginate through results |
| Combining `email` and `broadcast` in metrics | These are mutually exclusive as dimensions and as filters — the request is rejected |
| Expecting `unique_opened`/`open_rate`-style metrics without tracking enabled | Open/click tracking must be enabled on the sending domain for these to be meaningful |
| Assuming a longer `expiresIn` is possible | 48 hours is the maximum — requesting more returns a validation error |
| Treating share links as revocable | There's no revoke endpoint — the link is valid until it expires, no early invalidation |
