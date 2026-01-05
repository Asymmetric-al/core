# SendGrid Email Integration

Multi-tenant email sending through SendGrid. Each tenant connects their own SendGrid account.

## Current Implementation Status

| Feature | Status | Location |
|---------|--------|----------|
| API Key Validation | ✅ Complete | `src/lib/email/sendgrid.ts` |
| Email Sending | ✅ Complete | `src/lib/email/sendgrid.ts` |
| Test Email | ✅ Complete | `src/lib/email/sendgrid.ts` |
| Connect API | ✅ Complete | `src/app/api/email/connect/route.ts` |
| Test Send API | ✅ Complete | `src/app/api/email/test-send/route.ts` |
| Settings UI | ✅ Complete | `src/app/(admin)/mc/settings/integrations/sendgrid/page.tsx` |
| API Key Storage | 🔜 Planned | Database encryption needed |
| Event Webhooks | 🔜 Planned | Track opens/clicks/bounces |
| Campaign Management | 🔜 Planned | Bulk email campaigns |

---

## Quick Start

### 1. SendGrid Account Setup

Before connecting, tenants need:

1. **SendGrid Account** - [Create free account](https://signup.sendgrid.com/)
2. **API Key** with `mail.send` permission
3. **Verified Sender** - Either:
   - Single Sender Verification (quick, for testing)
   - Domain Authentication (recommended for production)

### 2. Creating an API Key

1. Go to [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys)
2. Click **Create API Key**
3. Select **Restricted Access**
4. Enable **Mail Send** → Full Access
5. Copy the key (starts with `SG.`)

### 3. Verifying a Sender

**Option A: Single Sender Verification** (Quick)
1. Go to [Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Click **Verify a Single Sender**
3. Fill in sender details
4. Click verification link in email

**Option B: Domain Authentication** (Recommended)
1. Go to [Domain Authentication](https://app.sendgrid.com/settings/sender_auth/domains)
2. Add your domain
3. Add DNS records (CNAME) to your domain
4. Verify in SendGrid

---

## Developer Guide

### File Structure

```
src/lib/email/
├── index.ts          # Public exports
├── constants.ts      # API endpoints, error codes, configs
└── sendgrid.ts       # Core service (validation, sending)

src/app/api/email/
├── connect/route.ts     # POST - Validate & connect API key
└── test-send/route.ts   # POST - Send test email

src/app/(admin)/mc/settings/integrations/sendgrid/
└── page.tsx          # Admin UI for connecting SendGrid
```

### Using the Email Service

```typescript
import {
  validateSendGridApiKey,
  sendEmail,
  sendTestEmail,
  createSendGridClient,
  SENDGRID_ERROR_CODES,
} from '@/lib/email'

// Validate an API key
const validation = await validateSendGridApiKey('SG.xxxxx')
if (!validation.valid) {
  console.error(validation.error)
  return
}

// Send an email
const result = await sendEmail('SG.xxxxx', {
  to: { email: 'user@example.com', name: 'John' },
  from: { email: 'hello@yourapp.com', name: 'Your App' },
  subject: 'Welcome!',
  html: '<h1>Welcome to our app!</h1>',
})

if (result.success) {
  console.log('Message ID:', result.messageId)
}

// Or use client pattern for multiple operations
const client = createSendGridClient('SG.xxxxx')
await client.validateKey()
await client.sendEmail({ ... })
await client.sendTestEmail('to@example.com', 'from@example.com', 'Name')
```

### API Endpoints

#### POST /api/email/connect

Validates API key and returns account info.

```typescript
// Request
{
  apiKey: string           // Required: SG.xxxxx
  defaultFromEmail: string // Required: Verified sender
  defaultFromName: string  // Required: Display name
  replyToEmail?: string    // Optional
}

// Response (success)
{
  success: true,
  connectionId: string,
  senderIdentities: SenderIdentity[],
  domainAuthentication: DomainAuthentication[],
  deliverabilityScore: number, // 0-100
  warnings: DeliverabilityWarning[]
}

// Response (error)
{
  success: false,
  error: string,
  errorCode: string
}
```

#### POST /api/email/test-send

Sends a test email.

```typescript
// Request
{
  apiKey: string    // Required
  toEmail: string   // Required
  fromEmail: string // Required: Must be verified
  fromName: string  // Required
}

// Response
{
  success: boolean,
  messageId?: string,
  message?: string,
  error?: string
}
```

---

## Configuration

### Environment Variables

```bash
# .env.local

# For webhook signature verification (future)
SENDGRID_WEBHOOK_VERIFICATION_KEY=

# For encrypting stored API keys (future)
EMAIL_ENCRYPTION_KEY=
```

### Constants

All configuration is in `src/lib/email/constants.ts`:

```typescript
// Rate limits (conservative defaults)
RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 500,
  maxRecipientsPerRequest: 1000,
  maxDailyEmails: 10000,
}

// Retry behavior
RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatuses: [429, 500, 502, 503, 504],
}
```

---

## Error Handling

### Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `invalid_api_key` | Key format wrong | Must start with `SG.` |
| `unauthorized` | Key invalid/revoked | Create new key in SendGrid |
| `forbidden` | Key lacks permissions | Enable `mail.send` scope |
| `rate_limited` | Too many requests | Wait and retry |
| `sender_not_verified` | From email not verified | Verify sender in SendGrid |
| `server_error` | SendGrid issue | Retry later |

### Handling Errors

```typescript
import { SENDGRID_ERROR_CODES } from '@/lib/email'

const result = await validateSendGridApiKey(apiKey)

if (!result.valid) {
  switch (result.errorCode) {
    case SENDGRID_ERROR_CODES.INVALID_API_KEY:
      // Show format error
      break
    case SENDGRID_ERROR_CODES.UNAUTHORIZED:
      // Key is bad
      break
    case SENDGRID_ERROR_CODES.FORBIDDEN:
      // Missing permissions
      break
    default:
      // Generic error
  }
}
```

---

## Deliverability

### Score Calculation

The `deliverabilityScore` (0-100) is calculated as:

- Base: 50 points
- +20 points: Has verified sender(s)
- +30 points: Has authenticated domain(s)

### Warnings

The validation returns warnings for:

| Code | Severity | Meaning |
|------|----------|---------|
| `NO_VERIFIED_SENDERS` | error | No verified senders found |
| `SENDER_NOT_VERIFIED` | error | Specified from email not verified |
| `DOMAIN_NOT_VERIFIED` | warning | Domain auth incomplete |
| `NO_DOMAIN_AUTH` | info | No domain authentication set up |

---

## Troubleshooting

### "The from address does not match a verified Sender Identity"

**Cause**: The `fromEmail` is not verified in SendGrid.

**Solutions**:
1. Verify the exact email address via Single Sender Verification
2. Or authenticate the domain the email belongs to

### "API key does not have permission"

**Cause**: The API key lacks required scopes.

**Solution**:
1. Go to SendGrid → API Keys
2. Edit the key or create a new one
3. Enable "Mail Send" permission

### "Invalid API key"

**Cause**: Key is incorrect, expired, or revoked.

**Solution**: Create a new API key in SendGrid and try again.

### Emails going to spam

**Causes & Solutions**:
1. **No domain authentication**: Set up DKIM/SPF
2. **No DMARC**: Add DMARC DNS record
3. **New domain/IP**: Warm up gradually
4. **Content issues**: Avoid spam trigger words

---

## Security

### API Key Handling

- Keys are validated server-side only
- Keys are never exposed to the client
- Keys should be encrypted when stored (future)

### Best Practices

1. **Restricted keys**: Only grant `mail.send` permission
2. **Key rotation**: Rotate keys periodically
3. **Audit logging**: Log key operations (without the key itself)
4. **No PII in logs**: Never log email addresses or content

---

## Future Enhancements

1. **Encrypted Key Storage** - Store API keys encrypted in database
2. **Event Webhooks** - Track delivery, opens, clicks, bounces
3. **Campaign Management** - Bulk sends with scheduling
4. **Template System** - Unlayer integration for email design
5. **Analytics Dashboard** - Delivery rates, engagement metrics
6. **Suppression Management** - Handle bounces and unsubscribes
