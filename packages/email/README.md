# Email Service (`src/lib/email`)

SendGrid email integration for multi-tenant email sending.

## Usage

```typescript
import { sendEmail, validateSendGridApiKey } from "@asym/email";

// Validate key
const { valid, warnings } = await validateSendGridApiKey("SG.xxx");

// Send email
const result = await sendEmail("SG.xxx", {
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
| `sendgrid.ts`  | Core service: validation, sending  |

## Prerequisites

1. SendGrid account with API key (needs `mail.send` scope)
2. Verified sender (single sender or domain auth)

## Docs

See [docs/modules/sendgrid-integration.md](/docs/modules/sendgrid-integration.md) for full documentation.
