import { canonicalOrigin } from "@asym/env/front-origin";

export const FRONT_STAMP_HEADER = "x-asym-front-stamp";
export const FRONT_ORIGIN_HEADER = "x-asym-front-origin";

const STAMP_VERSION = "v1";
const MIN_STAMP_KEY_BYTES = 32;
const MAX_AGE_SECONDS = 60;
const MAX_CLOCK_SKEW_SECONDS = 5;
const encoder = new TextEncoder();

export interface VerifyStampKeys {
  key: string | undefined;
  previousKey?: string | undefined;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]{43}$/.test(text)) return null;
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function hasValidStampKey(value: string | undefined): value is string {
  return (
    typeof value === "string" &&
    encoder.encode(value).byteLength >= MIN_STAMP_KEY_BYTES
  );
}

function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function stampPayload(
  origin: string,
  prefix: string,
  issuedAt: number,
): Uint8Array<ArrayBuffer> {
  return encoder.encode(`${STAMP_VERSION}\n${origin}\n${prefix}\n${issuedAt}`);
}

export async function signFrontStamp(
  origin: string,
  prefix: string,
  key: string,
  now: number = Date.now(),
): Promise<string> {
  const canonical = canonicalOrigin(origin);
  if (!canonical) {
    throw new Error("Front stamp requires a canonical http(s) origin.");
  }
  if (!prefix || !prefix.startsWith("/")) {
    throw new Error("Front stamp requires a dashboard prefix.");
  }
  if (!hasValidStampKey(key)) {
    throw new Error("Front stamp key must be at least 32 UTF-8 bytes.");
  }
  const issuedAt = Math.floor(now / 1000);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(key),
    stampPayload(canonical, prefix, issuedAt),
  );
  return `${STAMP_VERSION}.${issuedAt}.${toBase64Url(signature)}`;
}

export async function verifyFrontStamp(
  origin: string | null,
  prefix: string,
  stamp: string | null,
  keys: VerifyStampKeys,
  now: number = Date.now(),
): Promise<boolean> {
  const canonical = canonicalOrigin(origin);
  if (!canonical || !prefix || !stamp) return false;
  if (!hasValidStampKey(keys.key)) return false;
  const parts = stamp.split(".");
  if (parts.length !== 3 || parts[0] !== STAMP_VERSION) return false;
  const [, issued = "", signature = ""] = parts;
  if (!/^\d{1,12}$/.test(issued)) return false;
  const issuedAt = Number(issued);
  const age = Math.floor(now / 1000) - issuedAt;
  if (age < -MAX_CLOCK_SKEW_SECONDS || age > MAX_AGE_SECONDS) return false;
  const bytes = fromBase64Url(signature);
  if (!bytes) return false;
  const payload = stampPayload(canonical, prefix, issuedAt);
  if (
    await crypto.subtle.verify("HMAC", await hmacKey(keys.key), bytes, payload)
  ) {
    return true;
  }
  if (hasValidStampKey(keys.previousKey)) {
    return crypto.subtle.verify(
      "HMAC",
      await hmacKey(keys.previousKey),
      bytes,
      payload,
    );
  }
  return false;
}

export async function verifiedStampedOriginForRequest(
  request: Request,
  prefix: string,
  keys: VerifyStampKeys,
  now: number = Date.now(),
): Promise<string | null> {
  const origin = request.headers.get(FRONT_ORIGIN_HEADER);
  const stamped = await verifyFrontStamp(
    origin,
    prefix,
    request.headers.get(FRONT_STAMP_HEADER),
    keys,
    now,
  );
  if (!stamped || !origin) return null;
  const stampedUrl = new URL(origin);
  if (stampedUrl.protocol !== new URL(request.url).protocol) return null;
  const forwarded = request.headers.get("x-forwarded-host");
  if (forwarded === null) return origin;
  const forwardedHost = forwarded.trim().toLowerCase();
  const ownHost = request.headers.get("host")?.trim().toLowerCase() ?? "";
  if (forwardedHost === stampedUrl.host) return origin;
  if (ownHost !== "" && forwardedHost === ownHost) return origin;
  return null;
}
