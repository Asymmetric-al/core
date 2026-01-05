/**
 * Email Service Module Exports
 *
 * Central export point for the SendGrid email integration.
 * Import from '@/lib/email' in your code.
 *
 * ## Quick Start
 *
 * ```ts
 * import {
 *   validateSendGridApiKey,
 *   sendEmail,
 *   sendTestEmail,
 *   createSendGridClient,
 *   SENDGRID_ERROR_CODES,
 * } from '@/lib/email'
 *
 * // Validate API key
 * const result = await validateSendGridApiKey('SG.xxxxx')
 *
 * // Send email
 * const sendResult = await sendEmail('SG.xxxxx', {
 *   to: { email: 'user@example.com' },
 *   from: { email: 'hello@yourapp.com', name: 'Your App' },
 *   subject: 'Hello!',
 *   html: '<p>Hello, world!</p>',
 * })
 *
 * // Or use client pattern
 * const client = createSendGridClient('SG.xxxxx')
 * await client.sendEmail({ ... })
 * ```
 *
 * @module lib/email
 */

export {
  validateSendGridApiKey,
  sendEmail,
  sendTestEmail,
  createSendGridClient,
  type SendGridValidationResult,
  type SendEmailOptions,
} from './sendgrid'

export {
  SENDGRID_API_BASE,
  SENDGRID_ENDPOINTS,
  SENDGRID_REQUIRED_SCOPES,
  SENDGRID_OPTIONAL_SCOPES,
  SENDGRID_ERROR_CODES,
  HTTP_STATUS,
  RETRY_CONFIG,
  RATE_LIMIT_CONFIG,
  DELIVERABILITY_HELP_URLS,
  type SendGridErrorCode,
  type HttpStatusCode,
} from './constants'
