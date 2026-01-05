/**
 * SendGrid Integration Constants
 *
 * This module contains all configuration constants for the SendGrid email integration.
 * These values are used throughout the email service layer for API communication,
 * error handling, rate limiting, and retry logic.
 *
 * @module lib/email/constants
 * @see {@link https://docs.sendgrid.com/api-reference SendGrid API Reference}
 */

/**
 * Base URL for SendGrid's v3 REST API.
 * All API requests are made relative to this base URL.
 */
export const SENDGRID_API_BASE = 'https://api.sendgrid.com/v3'

/**
 * SendGrid API endpoint paths.
 * These are appended to SENDGRID_API_BASE for making API calls.
 *
 * @example
 * ```ts
 * const url = `${SENDGRID_API_BASE}${SENDGRID_ENDPOINTS.MAIL_SEND}`
 * // => 'https://api.sendgrid.com/v3/mail/send'
 * ```
 */
export const SENDGRID_ENDPOINTS = {
  /** Send email - POST /mail/send */
  MAIL_SEND: '/mail/send',
  /** List API keys - GET /api_keys */
  API_KEYS: '/api_keys',
  /** Get API key scopes - GET /scopes (validates key permissions) */
  SCOPES: '/scopes',
  /** List verified senders - GET /verified_senders */
  VERIFIED_SENDERS: '/verified_senders',
  /** List authenticated domains - GET /whitelabel/domains */
  DOMAIN_AUTHENTICATION: '/whitelabel/domains',
  /** Verify sender identity - POST /verified_senders/verify */
  SENDER_VERIFICATION: '/verified_senders/verify',
} as const

/**
 * Required API key scopes for the integration to function.
 * The API key MUST have these permissions or validation will fail.
 *
 * @remarks
 * When creating a SendGrid API key:
 * 1. Go to Settings → API Keys → Create API Key
 * 2. Select "Restricted Access"
 * 3. Enable "Mail Send" → Full Access
 *
 * @see {@link https://docs.sendgrid.com/ui/account-and-settings/api-keys}
 */
export const SENDGRID_REQUIRED_SCOPES = ['mail.send'] as const

/**
 * Optional API key scopes that enable additional features.
 * The integration works without these, but some features may be limited.
 *
 * - `sender_verification_eligible`: Check if sender can be verified
 * - `tracking_settings.read`: Read open/click tracking configuration
 * - `suppression.read`: Read bounce/unsubscribe lists
 */
export const SENDGRID_OPTIONAL_SCOPES = [
  'sender_verification_eligible',
  'tracking_settings.read',
  'suppression.read',
] as const

/**
 * Application-level error codes for SendGrid operations.
 * Used for programmatic error handling and user-friendly error messages.
 *
 * @example
 * ```ts
 * if (result.errorCode === SENDGRID_ERROR_CODES.UNAUTHORIZED) {
 *   // Handle invalid API key
 * }
 * ```
 */
export const SENDGRID_ERROR_CODES = {
  /** API key format is invalid (must start with 'SG.') */
  INVALID_API_KEY: 'invalid_api_key',
  /** API key is not recognized by SendGrid (401) */
  UNAUTHORIZED: 'unauthorized',
  /** API key lacks required permissions (403) */
  FORBIDDEN: 'forbidden',
  /** Request was rate limited by SendGrid (429) */
  RATE_LIMITED: 'rate_limited',
  /** SendGrid server error (5xx) */
  SERVER_ERROR: 'server_error',
  /** From email is not a verified sender */
  SENDER_NOT_VERIFIED: 'sender_not_verified',
  /** Domain does not have DKIM/SPF configured */
  DOMAIN_NOT_AUTHENTICATED: 'domain_not_authenticated',
  /** Email address format is invalid */
  INVALID_EMAIL: 'invalid_email',
  /** Email is on suppression list (bounced/unsubscribed) */
  SUPPRESSED: 'suppressed',
  /** Catch-all for unexpected errors */
  UNKNOWN: 'unknown',
} as const

/**
 * Standard HTTP status codes used in API responses.
 * Provides type-safe constants for status code comparisons.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

/**
 * Retry configuration for failed API requests.
 * Uses exponential backoff for transient failures.
 *
 * @remarks
 * - Retries happen automatically for network errors and 5xx responses
 * - Rate limit (429) responses use the Retry-After header when available
 * - Total max wait time: ~1s + ~2s + ~4s = ~7s worst case
 *
 * @example
 * ```
 * Attempt 1: Immediate
 * Attempt 2: Wait 1000ms
 * Attempt 3: Wait 2000ms
 * Attempt 4: Wait 4000ms (capped at maxDelayMs)
 * ```
 */
export const RETRY_CONFIG = {
  /** Maximum number of retry attempts after initial failure */
  maxRetries: 3,
  /** Initial delay between retries (doubles each attempt) */
  baseDelayMs: 1000,
  /** Maximum delay cap (prevents excessive waits) */
  maxDelayMs: 30000,
  /** HTTP status codes that trigger automatic retry */
  retryableStatuses: [429, 500, 502, 503, 504],
  /** Node.js error codes that trigger automatic retry */
  retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'],
} as const

/**
 * Rate limiting configuration to stay within SendGrid limits.
 *
 * @remarks
 * SendGrid's rate limits (as of 2024):
 * - Free tier: 100 emails/day
 * - Essentials: 50,000 emails/month
 * - Pro: 100,000+ emails/month
 * - API rate limit: ~600 requests/minute (varies by plan)
 *
 * These defaults are conservative to avoid hitting limits.
 *
 * @see {@link https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/rate-limits}
 */
export const RATE_LIMIT_CONFIG = {
  /** Max API requests per minute (below SendGrid's 600 limit) */
  maxRequestsPerMinute: 500,
  /** Max recipients per single send request (SendGrid limit: 1000) */
  maxRecipientsPerRequest: 1000,
  /** Default daily email limit per tenant */
  maxDailyEmails: 10000,
  /** Allow short bursts above steady-state rate */
  burstSize: 100,
} as const

/**
 * Help documentation URLs for common deliverability issues.
 * Used in warning messages and error guidance.
 */
export const DELIVERABILITY_HELP_URLS = {
  /** How to create and manage API keys */
  API_KEY: 'https://docs.sendgrid.com/ui/account-and-settings/api-keys',
  /** How to verify sender identity (Single Sender Verification) */
  SENDER_VERIFICATION: 'https://docs.sendgrid.com/ui/sending-email/sender-verification',
  /** How to set up domain authentication (DKIM/SPF) */
  DOMAIN_AUTHENTICATION: 'https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication',
  /** DMARC policy explanation */
  DMARC: 'https://docs.sendgrid.com/glossary/dmarc',
  /** SPF record explanation */
  SPF: 'https://docs.sendgrid.com/glossary/spf',
  /** DKIM signing explanation */
  DKIM: 'https://docs.sendgrid.com/glossary/dkim',
} as const

/**
 * Type exports for use in other modules
 */
export type SendGridErrorCode = typeof SENDGRID_ERROR_CODES[keyof typeof SENDGRID_ERROR_CODES]
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]
