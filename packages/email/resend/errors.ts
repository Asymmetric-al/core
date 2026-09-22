import { HTTP_STATUS, RESEND_ERROR_CODES, RETRY_CONFIG } from "../constants";
import { asNumber, asString, isJsonRecord } from "./json";

import type { ResendErrorDetails } from "./types";

export function mapResendErrorCode(
  name?: string | null,
  statusCode?: number | null,
): string {
  if (name === "missing_api_key" || name === "invalid_api_key") {
    return RESEND_ERROR_CODES.UNAUTHORIZED;
  }

  if (
    name === "restricted_api_key" ||
    name === "invalid_access" ||
    statusCode === HTTP_STATUS.FORBIDDEN
  ) {
    return RESEND_ERROR_CODES.FORBIDDEN;
  }

  if (
    name === "rate_limit_exceeded" ||
    statusCode === HTTP_STATUS.TOO_MANY_REQUESTS
  ) {
    return RESEND_ERROR_CODES.RATE_LIMITED;
  }

  if (
    name === "invalid_idempotency_key" ||
    name === "idempotency_key_conflict" ||
    statusCode === HTTP_STATUS.CONFLICT
  ) {
    return RESEND_ERROR_CODES.CONFLICT;
  }

  if (name === "invalid_from_address") {
    return RESEND_ERROR_CODES.SENDER_NOT_VERIFIED;
  }

  if (
    name === "validation_error" ||
    name === "missing_required_field" ||
    name === "invalid_parameter" ||
    statusCode === HTTP_STATUS.BAD_REQUEST
  ) {
    return RESEND_ERROR_CODES.VALIDATION_ERROR;
  }

  if (statusCode !== null && statusCode !== undefined && statusCode >= 500) {
    return RESEND_ERROR_CODES.SERVER_ERROR;
  }

  return RESEND_ERROR_CODES.UNKNOWN;
}

export function extractResendErrorDetails(
  errorLike: unknown,
): ResendErrorDetails {
  if (!isJsonRecord(errorLike)) {
    return {
      message: "Unknown Resend error",
    };
  }

  const name = asString(errorLike.name) ?? undefined;
  const message = asString(errorLike.message) ?? "Unknown Resend error";
  const statusCode = asNumber(errorLike.statusCode) ?? undefined;

  let retryAfter: number | undefined;
  const retryAfterValue = asNumber(errorLike.retryAfter);
  if (retryAfterValue !== null && retryAfterValue >= 0) {
    retryAfter = retryAfterValue;
  }

  return { name, message, statusCode, retryAfter };
}

function getHeaderValue(headers: unknown, name: string): string | null {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  if (!isJsonRecord(headers)) {
    return null;
  }

  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== lowerName) {
      continue;
    }

    return asString(value);
  }

  return null;
}

export function extractRetryAfterFromThrown(
  error: unknown,
): number | undefined {
  if (error && typeof error === "object" && "headers" in error) {
    const nested = extractRetryAfterSeconds(
      (error as { headers?: unknown }).headers,
    );
    if (nested !== undefined) {
      return nested;
    }
  }

  return extractRetryAfterSeconds(error);
}

export function extractRetryAfterSeconds(headers: unknown): number | undefined {
  const retryAfter = getHeaderValue(headers, "retry-after");
  if (!retryAfter) {
    return undefined;
  }

  const seconds = asNumber(retryAfter);
  if (seconds !== null && seconds >= 0) {
    return seconds;
  }

  const dateMs = Date.parse(retryAfter);
  if (Number.isFinite(dateMs)) {
    return Math.max(0, Math.ceil((dateMs - Date.now()) / 1000));
  }

  return undefined;
}

export function isRetryable(details: ResendErrorDetails): boolean {
  if (details.retryAfter !== undefined) {
    return true;
  }

  if (
    details.statusCode !== undefined &&
    RETRY_CONFIG.retryableStatuses.some(
      (statusCode) => statusCode === details.statusCode,
    )
  ) {
    return true;
  }

  const message = details.message.toLowerCase();
  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("aborted")
  ) {
    return true;
  }

  if (!details.name) {
    return false;
  }

  return RETRY_CONFIG.retryableErrors.some(
    (errorName) => errorName === details.name,
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function calculateResendRetryDelayMs(
  attemptNumber: number,
  retryAfterSeconds?: number,
): number {
  if (retryAfterSeconds !== undefined) {
    return Math.min(RETRY_CONFIG.maxDelayMs, retryAfterSeconds * 1000);
  }

  const exponential = RETRY_CONFIG.baseDelayMs * 2 ** attemptNumber;
  const cappedDelay = Math.min(RETRY_CONFIG.maxDelayMs, exponential);
  const jitter = cappedDelay * RETRY_CONFIG.jitterRatio * Math.random();
  return Math.min(RETRY_CONFIG.maxDelayMs, Math.round(cappedDelay + jitter));
}
