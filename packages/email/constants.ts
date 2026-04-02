/**
 * Resend integration constants.
 */

/**
 * Base URL for Resend's REST API.
 */
export const RESEND_API_BASE = "https://api.resend.com";

/**
 * Resend API endpoint paths.
 */
export const RESEND_ENDPOINTS = {
  EMAILS_SEND: "/emails",
  EMAILS_BATCH_SEND: "/emails/batch",
  API_KEYS: "/api-keys",
  DOMAINS: "/domains",
  WEBHOOKS: "/webhooks",
  RECEIVING_EMAIL: "/emails/receiving/:id",
  RECEIVING_ATTACHMENTS: "/emails/receiving/:id/attachments",
} as const;

/**
 * Required API key permissions for sending email.
 */
export const RESEND_REQUIRED_PERMISSIONS = ["sending_access"] as const;

/**
 * Optional permissions that unlock additional account metadata.
 */
export const RESEND_OPTIONAL_PERMISSIONS = ["full_access"] as const;

/**
 * Application-level error codes for Resend operations.
 */
export const RESEND_ERROR_CODES = {
  INVALID_API_KEY: "invalid_api_key",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  CONFLICT: "conflict",
  VALIDATION_ERROR: "validation_error",
  RATE_LIMITED: "rate_limited",
  SERVER_ERROR: "server_error",
  SENDER_NOT_VERIFIED: "sender_not_verified",
  DOMAIN_NOT_AUTHENTICATED: "domain_not_authenticated",
  INVALID_EMAIL: "invalid_email",
  SUPPRESSED: "suppressed",
  WEBHOOK_SIGNATURE_INVALID: "webhook_signature_invalid",
  UNKNOWN: "unknown",
} as const;

/**
 * Standard HTTP status codes used by the integration.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Retry configuration for transient API/network errors.
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ["ETIMEDOUT", "ECONNRESET", "ENOTFOUND"],
} as const;

/**
 * Conservative defaults to stay under provider limits.
 */
export const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 200,
  maxRecipientsPerRequest: 50,
  maxDailyEmails: 10000,
  burstSize: 25,
} as const;

/**
 * Help URLs for common deliverability issues.
 */
export const DELIVERABILITY_HELP_URLS = {
  API_KEY: "https://resend.com/docs/dashboard/api-keys/introduction",
  SENDER_VERIFICATION: "https://resend.com/docs/dashboard/domains/introduction",
  DOMAIN_AUTHENTICATION:
    "https://resend.com/docs/dashboard/domains/introduction",
  DOMAIN_MISMATCH:
    "https://resend.com/docs/knowledge-base/403-error-domain-mismatch",
  WEBHOOKS: "https://resend.com/docs/dashboard/webhooks/introduction",
  INBOUND: "https://resend.com/docs/dashboard/emails/receiving-emails",
  DMARC: "https://resend.com/docs/knowledge-base/what-is-dmarc",
  SPF: "https://resend.com/docs/knowledge-base/what-is-spf",
  DKIM: "https://resend.com/docs/knowledge-base/what-is-dkim",
} as const;

export type ResendErrorCode =
  (typeof RESEND_ERROR_CODES)[keyof typeof RESEND_ERROR_CODES];
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
