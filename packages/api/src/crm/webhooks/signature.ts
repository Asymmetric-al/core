import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const TWENTY_WEBHOOK_SIGNATURE_HEADER = "x-twenty-webhook-signature";
export const TWENTY_WEBHOOK_TIMESTAMP_HEADER = "x-twenty-webhook-timestamp";

export type TwentyWebhookSignatureErrorCode =
  | "missing_secret"
  | "missing_signature"
  | "missing_timestamp"
  | "invalid_timestamp"
  | "stale_timestamp"
  | "invalid_signature";

export class TwentyWebhookSignatureError extends Error {
  constructor(
    readonly code: TwentyWebhookSignatureErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "TwentyWebhookSignatureError";
  }
}

export interface VerifyTwentyWebhookSignatureOptions {
  rawBody: string;
  headers: Headers;
  secret?: string | null;
  toleranceSeconds: number;
  now?: Date;
}

export interface VerifiedTwentyWebhookSignature {
  timestamp: Date;
  receivedSignature: string;
  signatureHash: string;
}

function normalizeSignature(value: string): string {
  return value.trim().replace(/^sha256=/i, "");
}

function parseWebhookTimestamp(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    const milliseconds = trimmed.length > 10 ? numeric : numeric * 1000;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

function safeCompareHex(left: string, right: string): boolean {
  if (!/^[0-9a-f]+$/i.test(left) || !/^[0-9a-f]+$/i.test(right)) {
    return false;
  }

  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function signTwentyWebhookPayload(
  rawBody: string,
  timestamp: string,
  secret: string,
): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}:${rawBody}`)
    .digest("hex");
}

export function verifyTwentyWebhookSignature(
  options: VerifyTwentyWebhookSignatureOptions,
): VerifiedTwentyWebhookSignature {
  const secret = options.secret?.trim();
  if (!secret) {
    throw new TwentyWebhookSignatureError(
      "missing_secret",
      "Twenty webhook secret is not configured.",
    );
  }

  const signatureHeader = options.headers.get(TWENTY_WEBHOOK_SIGNATURE_HEADER);
  if (!signatureHeader) {
    throw new TwentyWebhookSignatureError(
      "missing_signature",
      "Missing Twenty webhook signature.",
    );
  }

  const timestampHeader = options.headers.get(TWENTY_WEBHOOK_TIMESTAMP_HEADER);
  if (!timestampHeader) {
    throw new TwentyWebhookSignatureError(
      "missing_timestamp",
      "Missing Twenty webhook timestamp.",
    );
  }

  const timestamp = parseWebhookTimestamp(timestampHeader);
  if (!timestamp) {
    throw new TwentyWebhookSignatureError(
      "invalid_timestamp",
      "Invalid Twenty webhook timestamp.",
    );
  }

  const now = options.now ?? new Date();
  const ageMs = Math.abs(now.getTime() - timestamp.getTime());
  if (ageMs > options.toleranceSeconds * 1000) {
    throw new TwentyWebhookSignatureError(
      "stale_timestamp",
      "Stale Twenty webhook timestamp.",
    );
  }

  const receivedSignature = normalizeSignature(signatureHeader);
  const expectedSignature = signTwentyWebhookPayload(
    options.rawBody,
    timestampHeader,
    secret,
  );

  if (!safeCompareHex(expectedSignature, receivedSignature)) {
    throw new TwentyWebhookSignatureError(
      "invalid_signature",
      "Invalid Twenty webhook signature.",
    );
  }

  return {
    timestamp,
    receivedSignature,
    signatureHash: sha256Hex(receivedSignature),
  };
}
