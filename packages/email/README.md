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
});
```

## Files

| File           | Purpose                            |
| -------------- | ---------------------------------- |
| `index.ts`     | Public exports                     |
| `constants.ts` | Config, error codes, API endpoints |
| `resend.ts`    | Core service: validation, sending  |

## Prerequisites

1. Resend account with API key (needs sending access)
2. Verified sender (single sender or domain auth)

## Docs

See [docs/guides/features/resend-integration.md](/docs/guides/features/resend-integration.md) for full documentation.
