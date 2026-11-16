# Email Service (`packages/email`)

Resend email integration for multi-tenant email sending.

## Usage

```typescript
import { sendEmail, validateResendApiKey } from "@asym/email";

// Validate key
const { valid, warnings } = await validateResendApiKey("re_xxx");

// Send email
const result = await sendEmail("re_xxx", {
  to: { email: "user@example.com" },
  from: { email: "hello@yourapp.com", name: "App" },
  subject: "Hello",
  html: "<p>Hello!</p>",
  idempotencyKey: "welcome-email/user-123",
});
```

## Files

| File           | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `index.ts`     | Public exports                                                          |
| `constants.ts` | Config, error codes, API endpoints                                      |
| `resend.ts`    | Barrel for `@asym/email/resend`                                         |
| `resend/`      | Client, key validation, sending, inbound email and webhook verification |
| `types.ts`     | Row, request and config types for the integration                       |

## Prerequisites

1. Resend account with API key (needs sending access)
2. Verified sender (single sender or domain auth)

`sendEmail` rejects a send without an `idempotencyKey` (at most 256
characters); use a stable `<event-type>/<entity-id>` key. Single sends are
capped at 50 recipients (`RESEND_LIMITS.maxRecipientsPerEmail`);
bulk/campaign work should use explicit batching before calling Resend.

## Docs

See [docs/guides/features/resend-integration.md](/docs/guides/features/resend-integration.md) for full documentation.
