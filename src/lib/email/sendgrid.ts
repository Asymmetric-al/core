/**
 * SendGrid Service Module
 *
 * Core service layer for SendGrid email integration. Handles API key validation,
 * email sending, and deliverability checks. All operations are server-side only.
 *
 * ## Quick Start
 *
 * ```ts
 * import { validateSendGridApiKey, sendEmail, sendTestEmail } from '@/lib/email'
 *
 * // Validate an API key
 * const result = await validateSendGridApiKey('SG.xxxxx')
 * if (result.valid) {
 *   console.log('Key is valid with scopes:', result.scopes)
 * }
 *
 * // Send an email
 * const sendResult = await sendEmail('SG.xxxxx', {
 *   to: { email: 'recipient@example.com', name: 'John' },
 *   from: { email: 'sender@yourdomain.com', name: 'Your App' },
 *   subject: 'Hello!',
 *   html: '<p>Hello, world!</p>',
 * })
 * ```
 *
 * ## Architecture Notes
 *
 * - **Multi-tenant**: API keys are passed per-request, not stored globally
 * - **Server-side only**: Never import this module in client components
 * - **Retry logic**: Automatic retries with exponential backoff for transient failures
 * - **No PII logging**: Email addresses and content are never logged
 *
 * @module lib/email/sendgrid
 * @see {@link https://docs.sendgrid.com/api-reference/mail-send/mail-send}
 */

import sgMail from '@sendgrid/mail'
import type { MailDataRequired } from '@sendgrid/mail'
import { SENDGRID_API_BASE, SENDGRID_ERROR_CODES, HTTP_STATUS, RETRY_CONFIG } from './constants'
import type {
  SenderIdentity,
  DomainAuthentication,
  DeliverabilityWarning,
  EmailRecipient,
  EmailSendResult
} from '@/types/email'

/**
 * Result of validating a SendGrid API key.
 *
 * @example
 * ```ts
 * const result = await validateSendGridApiKey(apiKey)
 * if (result.valid) {
 *   // Key is good, check deliverability
 *   if (result.deliverabilityScore < 70) {
 *     console.warn('Low deliverability score:', result.warnings)
 *   }
 * } else {
 *   console.error('Invalid key:', result.error)
 * }
 * ```
 */
export interface SendGridValidationResult {
  /** Whether the API key is valid and has required permissions */
  valid: boolean
  /** Human-readable error message if validation failed */
  error?: string
  /** Machine-readable error code for programmatic handling */
  errorCode?: string
  /** List of permission scopes granted to this API key */
  scopes?: string[]
  /** Verified sender identities in the SendGrid account */
  senderIdentities?: SenderIdentity[]
  /** Authenticated domains (DKIM/SPF) in the account */
  domainAuthentication?: DomainAuthentication[]
  /** Calculated deliverability score (0-100) */
  deliverabilityScore?: number
  /** Warnings about potential deliverability issues */
  warnings?: DeliverabilityWarning[]
}

/**
 * Options for sending an email through SendGrid.
 *
 * @example
 * ```ts
 * const options: SendEmailOptions = {
 *   to: [
 *     { email: 'john@example.com', name: 'John Doe' },
 *     { email: 'jane@example.com', name: 'Jane Doe' },
 *   ],
 *   from: { email: 'hello@yourapp.com', name: 'Your App' },
 *   replyTo: { email: 'support@yourapp.com' },
 *   subject: 'Your Weekly Update',
 *   html: '<h1>Hello!</h1><p>Here is your update...</p>',
 *   trackOpens: true,
 *   trackClicks: true,
 *   customArgs: { campaign_id: 'weekly-update-2024' },
 * }
 * ```
 */
export interface SendEmailOptions {
  /** Recipient(s) - single object or array for multiple recipients */
  to: EmailRecipient | EmailRecipient[]
  /** Sender email and display name (must be verified in SendGrid) */
  from: { email: string; name: string }
  /** Optional reply-to address (different from sender) */
  replyTo?: { email: string; name?: string }
  /** Email subject line */
  subject: string
  /** HTML email body (required) */
  html: string
  /** Plain text fallback (auto-generated from HTML if not provided) */
  text?: string
  /** Track email opens via tracking pixel (default: true) */
  trackOpens?: boolean
  /** Track link clicks via redirect URLs (default: true) */
  trackClicks?: boolean
  /** Custom metadata attached to this send (appears in webhooks) */
  customArgs?: Record<string, string>
}

/**
 * Fetch wrapper with automatic retry and exponential backoff.
 *
 * Retries on:
 * - HTTP 429 (rate limited) - uses Retry-After header if present
 * - HTTP 5xx (server errors)
 * - Network errors (ETIMEDOUT, ECONNRESET, ENOTFOUND)
 *
 * @internal
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = RETRY_CONFIG.maxRetries
): Promise<Response> {
  let lastError: Error | null = null
  let delay: number = RETRY_CONFIG.baseDelayMs

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options)

        if (!(RETRY_CONFIG.retryableStatuses as readonly number[]).includes(response.status)) {
          return response
        }

        if (attempt === retries) {
          return response
        }

        const retryAfter = response.headers.get('Retry-After')
        if (retryAfter) {
          delay = parseInt(retryAfter, 10) * 1000
        }
      } catch (error) {
        lastError = error as Error
        const errorCode = (error as NodeJS.ErrnoException).code
        if (errorCode && !(RETRY_CONFIG.retryableErrors as readonly string[]).includes(errorCode)) {
          throw error
        }
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay))
        delay = Math.min(delay * 2, RETRY_CONFIG.maxDelayMs)
      }
    }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Validate a SendGrid API key and check account configuration.
 *
 * This function performs comprehensive validation:
 * 1. Validates API key format (must start with 'SG.')
 * 2. Calls SendGrid /scopes endpoint to verify the key
 * 3. Checks for required 'mail.send' permission
 * 4. Fetches verified sender identities
 * 5. Fetches authenticated domains
 * 6. Calculates a deliverability score
 *
 * ## Deliverability Score Calculation
 *
 * - Base: 50 points
 * - +20 points: Has at least one verified sender
 * - +30 points: Has at least one authenticated domain
 *
 * ## Common Error Scenarios
 *
 * | Error Code | Cause | Solution |
 * |------------|-------|----------|
 * | `invalid_api_key` | Key doesn't start with 'SG.' | Check key format |
 * | `unauthorized` | Key is invalid or revoked | Create new key in SendGrid |
 * | `forbidden` | Key lacks mail.send scope | Edit key permissions |
 *
 * @param apiKey - SendGrid API key (starts with 'SG.')
 * @returns Validation result with account details or error
 *
 * @example
 * ```ts
 * const result = await validateSendGridApiKey(apiKey)
 *
 * if (!result.valid) {
 *   // Show error to user
 *   showError(result.error)
 *   return
 * }
 *
 * // Check for warnings
 * if (result.warnings?.some(w => w.severity === 'error')) {
 *   // Block sending - critical issues
 * } else if (result.warnings?.length) {
 *   // Show warnings but allow sending
 * }
 * ```
 */
export async function validateSendGridApiKey(apiKey: string): Promise<SendGridValidationResult> {
  if (!apiKey || typeof apiKey !== 'string') {
    return {
      valid: false,
      error: 'API key is required',
      errorCode: SENDGRID_ERROR_CODES.INVALID_API_KEY,
    }
  }

  if (!apiKey.startsWith('SG.')) {
    return {
      valid: false,
      error: 'Invalid API key format. SendGrid API keys start with "SG."',
      errorCode: SENDGRID_ERROR_CODES.INVALID_API_KEY,
    }
  }

  try {
    const scopesResponse = await fetchWithRetry(`${SENDGRID_API_BASE}/scopes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (scopesResponse.status === HTTP_STATUS.UNAUTHORIZED) {
      return {
        valid: false,
        error: 'Invalid API key',
        errorCode: SENDGRID_ERROR_CODES.UNAUTHORIZED,
      }
    }

    if (scopesResponse.status === HTTP_STATUS.FORBIDDEN) {
      return {
        valid: false,
        error: 'API key does not have permission to access scopes. Please create a new key with at least "mail.send" permission.',
        errorCode: SENDGRID_ERROR_CODES.FORBIDDEN,
      }
    }

    if (!scopesResponse.ok) {
      return {
        valid: false,
        error: `SendGrid API error: ${scopesResponse.status}`,
        errorCode: SENDGRID_ERROR_CODES.SERVER_ERROR,
      }
    }

    const scopesData = await scopesResponse.json() as { scopes: string[] }
    const scopes = scopesData.scopes || []

    const hasMailSend = scopes.includes('mail.send')
    if (!hasMailSend) {
      return {
        valid: false,
        error: 'API key does not have "mail.send" permission. Please create a key with mail send access.',
        errorCode: SENDGRID_ERROR_CODES.FORBIDDEN,
        scopes,
      }
    }

    const warnings: DeliverabilityWarning[] = []
    let senderIdentities: SenderIdentity[] = []
    let domainAuthentication: DomainAuthentication[] = []

    try {
      const sendersResponse = await fetchWithRetry(`${SENDGRID_API_BASE}/verified_senders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (sendersResponse.ok) {
        const sendersData = await sendersResponse.json() as { results: SenderIdentity[] }
        senderIdentities = sendersData.results || []

        if (senderIdentities.length === 0) {
          warnings.push({
            code: 'NO_VERIFIED_SENDERS',
            message: 'No verified sender identities found. You need to verify at least one sender email address.',
            severity: 'error',
            helpUrl: 'https://docs.sendgrid.com/ui/sending-email/sender-verification',
          })
        }
      }
    } catch {
    }

    try {
      const domainsResponse = await fetchWithRetry(`${SENDGRID_API_BASE}/whitelabel/domains`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (domainsResponse.ok) {
        const domainsData = await domainsResponse.json() as DomainAuthentication[]
        domainAuthentication = domainsData || []

        const hasValidDomain = domainAuthentication.some(d => d.valid)
        if (!hasValidDomain && domainAuthentication.length > 0) {
          warnings.push({
            code: 'DOMAIN_NOT_VERIFIED',
            message: 'Domain authentication is not complete. Complete DNS setup for better deliverability.',
            severity: 'warning',
            helpUrl: 'https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication',
          })
        } else if (domainAuthentication.length === 0) {
          warnings.push({
            code: 'NO_DOMAIN_AUTH',
            message: 'No domain authentication configured. Consider setting up domain authentication for production sending.',
            severity: 'info',
            helpUrl: 'https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication',
          })
        }
      }
    } catch {
    }

    let deliverabilityScore = 50

    if (senderIdentities.length > 0) {
      deliverabilityScore += 20
    }

    const hasVerifiedDomain = domainAuthentication.some(d => d.valid)
    if (hasVerifiedDomain) {
      deliverabilityScore += 30
    }

    return {
      valid: true,
      scopes,
      senderIdentities,
      domainAuthentication,
      deliverabilityScore,
      warnings,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      valid: false,
      error: `Failed to validate API key: ${errorMessage}`,
      errorCode: SENDGRID_ERROR_CODES.UNKNOWN,
    }
  }
}

/**
 * Send an email through SendGrid.
 *
 * ## Features
 *
 * - Supports single or multiple recipients
 * - Automatic plain text generation from HTML
 * - Open and click tracking (configurable)
 * - Custom metadata for webhook correlation
 * - Correlation ID for tracing
 *
 * ## Important Notes
 *
 * - The `from` email MUST be a verified sender in SendGrid
 * - Maximum 1000 recipients per request (SendGrid limit)
 * - HTML is required; text is auto-generated if not provided
 *
 * @param apiKey - SendGrid API key with mail.send permission
 * @param options - Email send options (recipients, content, tracking)
 * @returns Send result with message ID or error details
 *
 * @example
 * ```ts
 * // Simple send
 * const result = await sendEmail(apiKey, {
 *   to: { email: 'user@example.com' },
 *   from: { email: 'hello@yourapp.com', name: 'Your App' },
 *   subject: 'Welcome!',
 *   html: '<h1>Welcome to our app!</h1>',
 * })
 *
 * if (result.success) {
 *   console.log('Sent! Message ID:', result.messageId)
 * } else {
 *   console.error('Failed:', result.errors)
 * }
 * ```
 */
export async function sendEmail(
  apiKey: string,
  options: SendEmailOptions
): Promise<EmailSendResult> {
  const correlationId = crypto.randomUUID()

  try {
    sgMail.setApiKey(apiKey)

    const recipients = Array.isArray(options.to) ? options.to : [options.to]

    const msg: MailDataRequired = {
      to: recipients.map(r => ({ email: r.email, name: r.name })),
      from: options.from,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      trackingSettings: {
        clickTracking: { enable: options.trackClicks ?? true },
        openTracking: { enable: options.trackOpens ?? true },
      },
      customArgs: {
        correlation_id: correlationId,
        ...options.customArgs,
      },
    }

    const [response] = await sgMail.send(msg)

    return {
      success: true,
      messageId: response.headers['x-message-id'] as string,
      correlationId,
      recipientCount: recipients.length,
    }
  } catch (error) {
    const err = error as { response?: { body?: { errors?: Array<{ message: string; field?: string }> } }; message?: string }

    return {
      success: false,
      correlationId,
      recipientCount: 0,
      errors: err.response?.body?.errors?.map(e => ({
        code: SENDGRID_ERROR_CODES.UNKNOWN,
        message: e.message,
        email: e.field,
      })) || [{
        code: SENDGRID_ERROR_CODES.UNKNOWN,
        message: err.message || 'Failed to send email',
      }],
    }
  }
}

/**
 * Send a test email to verify SendGrid configuration.
 *
 * Sends a nicely formatted test email with:
 * - Success checkmark visual
 * - Sender/recipient details
 * - Timestamp
 *
 * This is typically called from the admin UI after connecting SendGrid
 * to verify the integration is working end-to-end.
 *
 * @param apiKey - SendGrid API key
 * @param toEmail - Recipient email address (usually the admin's email)
 * @param fromEmail - Sender email (must be verified in SendGrid)
 * @param fromName - Sender display name
 * @returns Send result
 *
 * @example
 * ```ts
 * // After user enters API key in settings UI
 * const result = await sendTestEmail(
 *   apiKey,
 *   'admin@company.com',    // Send to admin
 *   'hello@company.com',    // From verified sender
 *   'Company Name'
 * )
 *
 * if (result.success) {
 *   showToast('Test email sent! Check your inbox.')
 * }
 * ```
 */
export async function sendTestEmail(
  apiKey: string,
  toEmail: string,
  fromEmail: string,
  fromName: string
): Promise<EmailSendResult> {
  return sendEmail(apiKey, {
    to: { email: toEmail },
    from: { email: fromEmail, name: fromName },
    subject: 'SendGrid Connection Test - Success!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; padding: 16px; margin-bottom: 16px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
            Connection Successful!
          </h1>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6;">
            Your SendGrid integration is working correctly. You can now send emails from your application.
          </p>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              <strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;<br/>
              <strong>To:</strong> ${toEmail}<br/>
              <strong>Sent:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">
            This is a test email sent via SendGrid from your Give Hope application.
          </p>
        </div>
      </div>
    `,
    trackOpens: false,
    trackClicks: false,
    customArgs: {
      type: 'test_connection',
    },
  })
}

/**
 * Strip HTML tags to create plain text version of email.
 * Removes style/script blocks and normalizes whitespace.
 *
 * @internal
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Create a SendGrid client scoped to a specific API key.
 *
 * This is useful when you need to perform multiple operations
 * with the same API key without passing it each time.
 *
 * @param apiKey - SendGrid API key
 * @returns Object with bound methods
 *
 * @example
 * ```ts
 * // Create client for a tenant
 * const client = createSendGridClient(tenantApiKey)
 *
 * // Validate
 * const validation = await client.validateKey()
 *
 * // Send emails
 * await client.sendEmail({ ... })
 * await client.sendTestEmail('test@example.com', 'from@example.com', 'Name')
 * ```
 */
export function createSendGridClient(apiKey: string) {
  return {
    validateKey: () => validateSendGridApiKey(apiKey),
    sendEmail: (options: SendEmailOptions) => sendEmail(apiKey, options),
    sendTestEmail: (toEmail: string, fromEmail: string, fromName: string) =>
      sendTestEmail(apiKey, toEmail, fromEmail, fromName),
  }
}
