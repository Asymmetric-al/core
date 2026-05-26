# Contacts

## Overview

Contacts represent email recipients stored in Resend. They support custom properties, segment assignment, and topic subscriptions for managing audiences and preferences.

## SDK Methods

### Node.js

| Operation | Method | Notes |
|-----------|--------|-------|
| Create | `resend.contacts.create(params)` | Add a contact with properties, segments, topics |
| Get | `resend.contacts.get({ id })` or `resend.contacts.get({ email })` | Lookup by ID or email |
| List | `resend.contacts.list({ limit?, offset?, segmentId? })` | Filter by segment |
| Update | `resend.contacts.update(params)` | By `id` or `email` |
| Delete | `resend.contacts.remove({ id })` or `resend.contacts.remove({ email })` | Not `.delete()` |

### Python

`resend.Contacts.create/get/list/update/remove` — same operations with snake_case params (e.g., `first_name`, `last_name`, `segment_id`).

## Create Contact

```typescript
const { data, error } = await resend.contacts.create({
  email: 'alice@example.com',
  firstName: 'Alice',
  lastName: 'Smith',
  unsubscribed: false,
  properties: {
    plan: 'enterprise',
    company: 'Acme Corp',
    signupDate: '2026-01-15',
  },
  segments: [{ id: 'seg_abc123' }],
  topics: [
    { id: 'topic_product_updates', subscription: 'opt_in' },
    { id: 'topic_marketing', subscription: 'opt_out' },
  ],
});
if (error) {
  console.error(error);
  return;
}
console.log(data.id); // contact ID
```

```python
contact = resend.Contacts.create({
    "email": "alice@example.com",
    "first_name": "Alice",
    "last_name": "Smith",
    "unsubscribed": False,
    "properties": {
        "plan": "enterprise",
        "company": "Acme Corp",
    },
})

# Add to segment separately (Python SDK doesn't support segments/topics on create)
resend.Contacts.Segments.add({"contact_id": contact["id"], "segment_id": "seg_abc123"})
```

## Get and Update

```typescript
// Get by email (alternative: pass { id: 'contact_uuid' })
const { data, error } = await resend.contacts.get({ email: 'alice@example.com' });

// Update by email — change properties, set a property to null to delete it
const { data: updated, error: updateErr } = await resend.contacts.update({
  email: 'alice@example.com',
  firstName: 'Alicia',
  properties: {
    plan: 'pro',       // update existing property
    company: null,     // delete this property
  },
});
```

## Delete and List

```typescript
// Delete by ID or email — pick one
const { data, error } = await resend.contacts.remove({ email: 'alice@example.com' });

// List with segment filter
const { data: contacts, error: listErr } = await resend.contacts.list({
  segmentId: 'seg_abc123',
  limit: 50,
});
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Passing both `id` and `email` to get/update/remove | Use one or the other — not both |
| Using `audienceId` (Node.js) | Segments replaced audiences — use `segmentId`. Python SDK still uses `audience_id` in create params |
| Calling `.delete()` | SDK method is `.remove()` |
| Expecting property deletion with empty string | Set property value to `null` to delete it |
| Not checking `error` in Node.js | SDK returns `{ data, error }`, does not throw — always destructure and check |
| Forgetting `email` is required on create | `email` is the only required field — all others are optional |
