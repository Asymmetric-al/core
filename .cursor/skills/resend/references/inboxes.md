# Inboxes

An inbox sends and receives email at one address on your domain. Received and sent emails group into threads. Each thread is in one folder and can carry labels. Drafts hold unsent emails, and agent settings tell an AI agent how to handle the threads of the inbox.

Inboxes need Node.js `resend` 6.34.1 or later, or Python `resend` 2.50.0 or later.

If an agent acts on the content of received emails, also install the `agent-email-inbox` skill. It covers the security levels for untrusted input.

## SDK Methods

| Operation | Node.js | Python |
|-----------|---------|--------|
| Create inbox | `resend.inboxes.create(params)` | `resend.Inboxes.create(params)` |
| List inboxes | `resend.inboxes.list(params?)` | `resend.Inboxes.list(params?)` |
| Get inbox | `resend.inboxes.get(idOrEmail)` | `resend.Inboxes.get(inbox_id)` |
| Update inbox | `resend.inboxes.update(id, params)` | `resend.Inboxes.update(params)`, `id` inside params |
| Delete inbox | `resend.inboxes.remove(id)` | `resend.Inboxes.remove(inbox_id)` |
| Get agent settings | `resend.inboxes.agent.get({ inboxId })` | `resend.Inboxes.Agent.get(inbox_id)` |
| Update agent settings | `resend.inboxes.agent.update({ inboxId, ...params })` | `resend.Inboxes.Agent.update(params)`, `inbox_id` inside params |
| List labels | `resend.inboxes.labels.list({ inboxId })` | `resend.Inboxes.Labels.list(inbox_id)` |
| Create label | `resend.inboxes.labels.create({ inboxId, ...params })` | `resend.Inboxes.Labels.create(params)`, `inbox_id` inside params |
| Update label | `resend.inboxes.labels.update({ inboxId, labelId, ...params })` | `resend.Inboxes.Labels.update(params)`, `inbox_id` and `id` inside params |
| Delete label | `resend.inboxes.labels.remove({ inboxId, labelId })` | `resend.Inboxes.Labels.remove(inbox_id, label_id)` |
| List threads | `resend.inboxes.threads.list({ inboxId, ...params })` | `resend.Inboxes.Threads.list(inbox_id, params?)` |
| Search threads | `resend.inboxes.threads.search({ inboxId, ...params })` | `resend.Inboxes.Threads.search(inbox_id, params?)` |
| Get thread | `resend.inboxes.threads.get({ inboxId, threadId })` | `resend.Inboxes.Threads.get(inbox_id, thread_id)` |
| Update thread | `resend.inboxes.threads.update({ inboxId, threadId, ...params })` | `resend.Inboxes.Threads.update(params)`, `inbox_id` and `id` inside params |
| Delete thread | `resend.inboxes.threads.remove({ inboxId, threadId })` | `resend.Inboxes.Threads.remove(inbox_id, thread_id)` |
| Add thread labels | `resend.inboxes.threads.labels.add({ inboxId, threadId, labels })` | `resend.Inboxes.Threads.Labels.add(params)`, `inbox_id`, `thread_id` and `labels` inside params |
| Set thread labels | `resend.inboxes.threads.labels.set({ inboxId, threadId, labels })` | `resend.Inboxes.Threads.Labels.set(params)`, `inbox_id`, `thread_id` and `labels` inside params |
| Remove thread label | `resend.inboxes.threads.labels.remove({ inboxId, threadId, labelId })` | `resend.Inboxes.Threads.Labels.remove(inbox_id, thread_id, label_id)` |
| List thread emails | `resend.inboxes.threads.emails.list({ inboxId, threadId, ...params })` | `resend.Inboxes.Threads.Emails.list(inbox_id, thread_id, params?)` |
| Get thread email | `resend.inboxes.threads.emails.get({ inboxId, threadId, emailId })` | `resend.Inboxes.Threads.Emails.get(inbox_id, thread_id, email_id)` |
| Reply to thread email | `resend.inboxes.threads.emails.reply({ inboxId, threadId, emailId, ...params })` | `resend.Inboxes.Threads.Emails.reply(params)`, `inbox_id`, `thread_id` and `email_id` inside params |
| Forward thread email | `resend.inboxes.threads.emails.forward({ inboxId, threadId, emailId, ...params })` | `resend.Inboxes.Threads.Emails.forward(params)`, `inbox_id`, `thread_id` and `email_id` inside params |
| List drafts | `resend.inboxes.drafts.list({ inboxId, ...params })` | `resend.Inboxes.Drafts.list(inbox_id, params?)` |
| Create draft | `resend.inboxes.drafts.create({ inboxId, ...params })` | `resend.Inboxes.Drafts.create(params)`, `inbox_id` inside params |
| Get draft | `resend.inboxes.drafts.get({ inboxId, draftId })` | `resend.Inboxes.Drafts.get(inbox_id, draft_id)` |
| Update draft | `resend.inboxes.drafts.update({ inboxId, draftId, ...params })` | `resend.Inboxes.Drafts.update(params)`, `inbox_id` and `id` inside params |
| Delete draft | `resend.inboxes.drafts.remove({ inboxId, draftId })` | `resend.Inboxes.Drafts.remove(inbox_id, draft_id)` |
| Send draft | `resend.inboxes.drafts.send({ inboxId, draftId })` | `resend.Inboxes.Drafts.send(inbox_id, draft_id)` |

Use `.remove()`, not `.delete()`, in the Node.js SDK.

Every inbox endpoint takes the inbox ID or the inbox email address in the path. In Node.js, pass `emailAddress` in place of `inboxId`, for example `{ emailAddress: 'support@acme.com', threadId }`. `get`, `update` and `remove` take either one as the first argument. In Python, `inbox_id` takes either one.

## Inboxes

```typescript
// Create an inbox on a domain of your team
const { data: created, error } = await resend.inboxes.create({
  emailAddress: 'support@acme.com',
  name: 'Customer Support',
  fromName: 'Ada from Support',
});
// created: { object: 'inbox', id }

// List inboxes, newest first
const { data: inboxes } = await resend.inboxes.list({ limit: 20 });
// inboxes.data[i]: { id, name, email_address, from_name, unread, last_received, created_at, updated_at }

// Get an inbox by ID or by email address
const { data: inbox } = await resend.inboxes.get('support@acme.com');
// inbox: { object, id, name, email_address, domain_id, receiving_address, from_name, unread, drafts, last_received, created_at, updated_at }

// Change the internal name or the name recipients see
const { data: updated } = await resend.inboxes.update('b3e2b2b6-3f0e-4c8e-9ad3-2f43a1e2c7f1', {
  name: 'Support',
  fromName: 'Acme Support',
});

// Delete an inbox
const { data: deleted } = await resend.inboxes.remove('b3e2b2b6-3f0e-4c8e-9ad3-2f43a1e2c7f1');
```

**Key gotchas:**
- Create returns only `{ object, id }`. Call `get` for the other fields.
- Without `forwarding`, the domain must have receiving enabled, DKIM and SPF verified, and the inbound MX record verified or pending. With `forwarding: true`, the domain only needs DKIM and SPF, and Resend returns a `receiving_address` to forward mail to.
- Create returns 422 for a domain that does not meet these rules, 409 for an address already in use, 403 when the team is at the inbox limit of its plan, and 451 for a blocked account.
- The email address in the path matches without case. An unknown ID or address returns 404 `not_found`.
- The local part of `emailAddress` can contain only letters, numbers, `.`, `_`, `%` and `-`. A `+` returns 422.
- List items carry fewer fields than `get`. `created_at`, `updated_at` and `last_received` are ISO 8601 strings.
- `fromName` is a plain name, not `Name <email>`. It cannot contain a colon, `<`, `>`, or line breaks. An empty string removes it.
- Update needs at least one of `name` or `fromName`.

## Agent Settings

```typescript
const inboxId = 'b3e2b2b6-3f0e-4c8e-9ad3-2f43a1e2c7f1';

const { data: agent } = await resend.inboxes.agent.get({ inboxId });
// agent: { object: 'inbox_agent', instructions, tone, actions }

const { data: updated } = await resend.inboxes.agent.update({
  inboxId,
  instructions: 'Answer refund questions yourself. Escalate legal threats.',
  tone: 'concise_professional',
  actions: ['draft_reply', 'add_labels'],
});
// updated: { object: 'inbox_agent', id }
```

**Key gotchas:**
- An inbox without an agent returns `instructions: null`, `tone: null` and `actions: []`. Update creates the agent when the inbox has none.
- Omitted fields keep their value. Send `null` to clear `instructions` or `tone`.
- `actions` replaces the whole set, without duplicates. Send `[]` to disable all actions. The values are `draft_reply`, `forward_thread`, `add_labels`, `assign_thread`, `mark_as_spam`, `archive` and `move_to_trash`.
- `instructions` is at most 4000 characters.
- `tone` is one of `concise_professional`, `concise_casual`, `expanded_professional` and `expanded_casual`.
- Update returns only `{ object, id }`. Call `get` for the settings.

## Labels

```typescript
const inboxId = 'b3e2b2b6-3f0e-4c8e-9ad3-2f43a1e2c7f1';

const { data: label } = await resend.inboxes.labels.create({
  inboxId,
  name: 'Urgent',
  color: '#E93D82',
});
// label: { object: 'inbox_label', id }

const { data: labels } = await resend.inboxes.labels.list({ inboxId });
// labels.data[i]: { id, name, color, created_at }

await resend.inboxes.labels.update({
  inboxId,
  labelId: label.id,
  name: 'Billing',
  color: '#F76B15',
});

await resend.inboxes.labels.remove({ inboxId, labelId: label.id });
```

**Key gotchas:**
- `color` is a `#RRGGBB` hex string. The API returns it in uppercase. Without `color`, the API picks a random color.
- An inbox has at most 100 labels. Names are unique per inbox, compared without case. A duplicate name or a full inbox returns 422.
- The list is not paginated. It returns every label, oldest first.
- To label a thread, call `threads.labels.add`. `threads.labels.remove` takes the label off the thread and keeps it on the inbox. Only `labels.remove` deletes it.
- Deleting a label removes it from every thread. It does not send `inbox.thread.labels.updated` for those threads.

## Threads

```typescript
const inboxId = 'b3e2b2b6-3f0e-4c8e-9ad3-2f43a1e2c7f1';
const threadId = '7c1f0a2e-5d3b-4e8a-9f61-2b8d4c6e1a90';
const labelId = '7f9c1d2e-4a6b-4c3d-8e15-9b0a7c6d5e34';

// Unread threads in the Inbox folder, most recently active first
const { data: threads } = await resend.inboxes.threads.list({
  inboxId,
  folders: ['inbox'],
  read: false,
  limit: 20,
});
// threads.data[i]: { id, subject, from, to, cc, bcc, labels, email_count, has_attachment, has_draft, read, received_at, folder }

// Find threads by text, sender, recipient, attachment or date
const { data: results } = await resend.inboxes.threads.search({
  inboxId,
  query: 'invoice -draft',
  from: ['billing@example.com'],
  hasAttachment: true,
  startDate: '2026-09-01',
  endDate: '2026-09-30',
});
// results.data[i]: the thread fields plus matched_email_id

const { data: thread } = await resend.inboxes.threads.get({ inboxId, threadId });
// thread: { object, id, subject, folder, labels, read }

// Mark read and move to a folder
const { data: changed } = await resend.inboxes.threads.update({
  inboxId,
  threadId,
  read: true,
  folder: 'archive',
});

// Add labels, replace all labels, or remove one label
const { data: added } = await resend.inboxes.threads.labels.add({ inboxId, threadId, labels: [labelId] });
// added: { object: 'list', data: [{ id, name, color }] }, every label now on the thread
await resend.inboxes.threads.labels.set({ inboxId, threadId, labels: [labelId] });
await resend.inboxes.threads.labels.remove({ inboxId, threadId, labelId });

// Move the thread to trash
const { data: trashed } = await resend.inboxes.threads.remove({ inboxId, threadId });
// trashed: { object, id, deleted }
```

**Key gotchas:**
- Folders are `inbox`, `archive`, `spam`, `sent` and `trash`. A thread is in exactly one folder. The API sets `sent` for threads with only outbound emails. You cannot set it.
- `folders` defaults to `['inbox']`, or to `['inbox', 'archive', 'sent']` when `labels` is set. `spam` and `trash` are only included when you name them.
- `after` and `before` take a thread ID, not a date. Pass only one of them. A cursor thread that is not in the selected folders returns 404.
- Search can be up to about a minute behind new emails. All filters must match. `query`, `from`, `to`, `cc`, `bcc`, `hasAttachment`, `startDate` and `endDate` must all match the same email in the thread. When you set any of them, that email must itself be in one of `folders`.
- In `query`, every word must match. Wrap words in double quotes for an exact phrase. Start a word with `-` to exclude it.
- A search result has `matched_email_id`, the `id` of the email that matched. Pass it as `emailId` to the thread email endpoints.
- Update needs at least one of `read` or `folder`.
- `threads.labels.add` takes 1 to 10 label IDs and keeps the labels already on the thread. `threads.labels.set` takes 0 to 100 IDs and replaces every label. Send `[]` to clear them.
- `threads.labels.remove` takes one label off the thread. The label itself stays on the inbox.
- All three return every label on the thread after the change. An unknown label ID returns 404.
- `remove` moves the thread to `trash` and deletes it after 30 days. To restore it, update `folder` to `inbox`, `archive` or `spam`.

## Thread Emails

```typescript
const inboxId = 'b3e2b2b6-3f0e-4c8e-9ad3-2f43a1e2c7f1';
const threadId = '7c1f0a2e-5d3b-4e8a-9f61-2b8d4c6e1a90';

// Emails in the thread, oldest first
const { data: emails } = await resend.inboxes.threads.emails.list({ inboxId, threadId });
const emailId = emails.data[emails.data.length - 1].id;

// The full email, body included
const { data: email } = await resend.inboxes.threads.emails.get({ inboxId, threadId, emailId });
// email: { id, direction, from, to, cc, bcc, reply_to, subject, message_id, html, text, attachments, read, received_at }

// Reply from the inbox address. The API sets `to` from the email you reply to.
const { data: reply } = await resend.inboxes.threads.emails.reply({
  inboxId,
  threadId,
  emailId,
  text: 'Refund issued for order 1041.',
  headers: { 'X-Ticket-Id': '4821' },
  attachments: [
    { filename: 'receipt.txt', content: Buffer.from('Order 1041 refunded').toString('base64') },
  ],
}, { idempotencyKey: `refund-reply/${emailId}` });
// reply: { id } (the sent email ID)

// Forward the email with its attachments
const { data: forwarded } = await resend.inboxes.threads.emails.forward({
  inboxId,
  threadId,
  emailId,
  to: ['delivered@resend.dev'],
  text: 'Flagging this refund request for you.',
}, { idempotencyKey: `refund-forward/${emailId}` });
// forwarded: { id } (the sent email ID)
```

**Key gotchas:**
- `threads.emails.list` returns the emails oldest first. Pass the last `id` as `after` for the next, newer page. A cursor that is not an email of the thread returns 404.
- The `emailId` comes from `threads.emails.list` or from `matched_email_id` in a search result, not from `resend.emails`.
- Reply sends right away, with no stored draft. For a received email, the reply goes to its `Reply-To` addresses, or to its sender. For an email the inbox sent, it goes to that email's `to` recipients. You cannot set `to` on a reply.
- With `replyAll: true`, a reply to a received email also copies the other `To` addresses and the `cc` of that email. A reply-all to an email the inbox sent goes to its Reply-To when that is not the inbox address, else to its `to`, and copies its `cc`. The inbox address is left out, and duplicates are removed.
- Reply needs `html` or `text` with more than whitespace. Without `subject`, the thread subject is used with a `Re:` prefix. Forward uses a `Fwd:` prefix.
- Forward needs `to`. It quotes the original email and sends its attachments with your `attachments`. An original attachment that was sent from a URL (`path`) cannot be forwarded, and the request returns 422.
- The `content` of all attachments can total at most 25 MB. On a forward, the original attachments count toward it. A `path` file does not count, because Resend fetches it at send time. The whole email, encoded, can be at most 40 MB.
- `attachments` and `headers` have the same shape as on `resend.emails.send()`. Resend sets `In-Reply-To`, `References` and `Reply-To`. Setting one of them in `headers`, in any letter case, returns 422. An empty header name, or a line break or null character in a name or value, also returns 422.
- An empty file, a blocked file type, or a `path` that is not an `http` or `https` URL, or that points to `localhost`, returns 422.
- Reply and forward return only the sent email ID.
- Reply and forward take an `idempotencyKey` option, as on `resend.emails.send()`. See [Idempotency Keys](#idempotency-keys).

## Drafts

```typescript
const inboxId = 'b3e2b2b6-3f0e-4c8e-9ad3-2f43a1e2c7f1';

// A draft that starts a new thread
const { data: draft } = await resend.inboxes.drafts.create({
  inboxId,
  to: ['delivered@resend.dev'],
  subject: 'Refund for order 1041',
  text: 'Refund issued for order 1041.',
  attachments: [
    {
      filename: 'receipt.txt',
      content: Buffer.from('Order 1041 refunded').toString('base64'),
      contentType: 'text/plain',
    },
  ],
}, { idempotencyKey: 'refund-draft/order-1041' });
// draft: { object: 'inbox_draft', id }

const { data: drafts } = await resend.inboxes.drafts.list({ inboxId, limit: 20 });

const { data: saved } = await resend.inboxes.drafts.get({ inboxId, draftId: draft.id });
// saved: { object, id, type, to, cc, bcc, subject, html, text, thread_id, reply_to_email_id, email_id, created_at, updated_at, attachments }
// saved.attachments[i]: { id, filename, content_type, size }

// Replace the body and every attachment
const { data: changed } = await resend.inboxes.drafts.update({
  inboxId,
  draftId: draft.id,
  html: '<p>Refund issued for order 1041.</p>',
  text: 'Refund issued for order 1041.',
  attachments: [
    {
      filename: 'invoice-1041.txt',
      content: Buffer.from('Invoice 1041, refunded in full').toString('base64'),
      contentType: 'text/plain',
    },
  ],
});
// changed: { object: 'inbox_draft', id }

const { data: sent } = await resend.inboxes.drafts.send(
  { inboxId, draftId: draft.id, headers: { 'X-Ticket-Id': '4821' } },
  { idempotencyKey: `refund-draft-send/${draft.id}` },
);
// sent: { id } (the sent email ID)

// Discard a draft you do not want to send
const { data: other } = await resend.inboxes.drafts.create({ inboxId, subject: 'Notes' });
await resend.inboxes.drafts.update({ inboxId, draftId: other.id, attachments: [] });
await resend.inboxes.drafts.remove({ inboxId, draftId: other.id });
```

**Key gotchas:**
- For a reply draft, pass `threadId` and `replyToEmailId` together. Without `to`, the API addresses it like a reply. Send `to: []` to leave it empty.
- Each email can have one unsent reply draft. Creating another returns 200 with the ID of the existing draft, not 201. That request ignores every other field except `attachments`, which replaces the attachments of the existing draft. With the `draft_reply` action on, the inbox agent can create that draft before you do.
- A draft needs at least one non-empty `to`, `cc`, `bcc`, `subject`, `text`, `html` or `attachments`. `to`, `cc` and `bcc` together have at most 50 recipients.
- The draft stores its attachments, so each one needs `content` (base64), `filename` and `contentType`. A `path` without `content`, or a `contentId`, returns 422. The files on a draft can total at most 25 MB. An empty file or a blocked file type, such as `.exe`, returns 422.
- An update with `attachments` replaces every attachment on the draft. Send `[]` to remove them all. Omit the field to keep them.
- An update that sets `text` or `html` replaces the whole body. The part you omit becomes `null`, so send both to keep both.
- Send needs at least one `to` recipient and `html` or `text`, or it returns 422. A new-thread draft also needs a non-empty `subject`.
- A reply draft created without `subject` has an empty subject. Send uses the thread subject with a `Re:` prefix.
- The sent email, encoded, can be at most 40 MB.
- Update, remove or send on a draft that was already sent returns 409.
- `drafts.list` returns only unsent drafts, most recently updated first.
- `drafts.send` takes `headers`, an object of string values, as on `resend.emails.send()`. Create and update do not take headers. The header rules of reply and forward apply.
- Create and send take an `idempotencyKey` option. See [Idempotency Keys](#idempotency-keys).

## Idempotency Keys

Create draft, send draft, reply and forward accept an idempotency key, the same as `resend.emails.send()`. Pass it in the options argument: `{ idempotencyKey }` in Node.js, `{"idempotency_key": ...}` in Python. Use it when you retry these calls, so a retry does not create a second draft or send a second email.

| Key Facts | |
|-----------|---|
| **Operations** | `drafts.create`, `drafts.send`, `threads.emails.reply`, `threads.emails.forward`. No other inbox operation takes it |
| **Format** | `<event-type>/<entity-id>` (e.g., `refund-reply/<email-id>`) |
| **Length** | 1 to 256 characters |
| **Expiration** | 24 hours |
| **Same key + same payload** | Returns the first successful (2xx) response without a new draft or email. The response has the `idempotent-replayed: true` header |
| **Failed first request** | Not stored. Retry it with the same key |
| **Same key + different payload** | Returns 409 `invalid_idempotent_request` |
| **Same key while the first request runs** | Returns 409 `concurrent_idempotent_requests` |

## API Key Permissions

- A full access key can call every inbox endpoint.
- A sending access key can call only reply, forward, create draft and send draft. Every other inbox endpoint returns 401 `restricted_api_key`.
- A sending access key limited to one domain works only on inboxes of that domain. An inbox on another domain returns 403.
- An agent that reads emails or lists threads needs a full access key.

## Webhook Events

Inboxes send `inbox.*` events. See the event list in [webhooks.md](webhooks.md#other-events).

- Each payload `data` has `source` (`api`, `dashboard`, `agent` or `system`) and `inbox_id`, plus `thread_id`, `email_id` or `draft_id` where they apply.
- Email and draft payloads carry the object without `html` or `text`. Call `threads.emails.get()` or `drafts.get()` for the body.
- The `draft` object in `inbox.draft.*` payloads lists `attachments` as `{ id, filename, content_type, size }`, without the file content.
- `inbox.deleted` carries only `inbox_id`. `inbox.draft.deleted` has no `draft` object.
- `inbox.created` and `inbox.updated` carry `inbox`, with the fields of `inboxes.get()`. Its timestamps are ISO 8601 strings.
- `inbox.thread.labels.updated` lists the changed labels in `added` and `removed`. One `threads.labels.set` call can fill both. A call that changes nothing sends no event.
- Sending a draft sends both `inbox.draft.sent` and `inbox.email.sent`, in no fixed order.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Reading fields from a create or update response | Create and update of inboxes, labels and drafts, and agent update, return only `{ object, id }`. Call `get` |
| Labeling a thread with `threads.update` | Update takes only `read` and `folder`. Use `threads.labels.add`, `set` or `remove` |
| Calling `threads.labels.set` to add one label | `set` replaces every label on the thread. Use `add` |
| Reading threads with a sending access key | That key can only reply, forward, create drafts and send drafts. Use a full access key |
| Setting `Reply-To` in `headers` on a reply, forward or draft send | Resend sets `In-Reply-To`, `References` and `Reply-To`. Leave them out of `headers` |
| Passing `to` on a reply | Reply sets `to` from the email you reply to. Use `forward` to send to someone new |
| Using an ID from `resend.emails.list()` as `emailId` | Use the ID from `threads.emails.list` or `matched_email_id` from a search |
| Expecting `threads.remove` to delete at once | It moves the thread to `trash` for 30 days. Update `folder` to restore it |
| Setting `folder: 'sent'` | `sent` is set by the API. Use `inbox`, `archive`, `spam` or `trash` |
| Using a named color like `'red'` | Use a `#RRGGBB` hex string |
| Passing a `path` attachment to a draft | Drafts store their files. Send `content`, `filename` and `contentType` |
| Sending `attachments` on a draft update to add one file | It replaces every attachment. Send the full list |
| Updating only `html` on a draft that has `text` | The omitted body part becomes `null`. Send both |
| Expecting a new email to show in search at once | Search can be up to about a minute behind. Use `threads.list` for the newest threads |
