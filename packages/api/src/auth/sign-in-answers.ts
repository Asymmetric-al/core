import { NextResponse } from "next/server";

export const SIGN_IN_PASSWORD_MAX_LENGTH = 1024;
export const SIGN_IN_EMAIL_MAX_LENGTH = 320;

export function signInAccountKey(address: string): string {
  return address.trim().toLowerCase();
}

const MAPPED_IPV4 = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;

function ipv6Prefix(address: string): string | null {
  const halves = address.toLowerCase().split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;
  const groups = [...head, ...Array(missing).fill("0"), ...tail];
  if (!groups.every((group) => /^[0-9a-f]{1,4}$/.test(group))) return null;
  return `${groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

export function signInClientAddress(request: Request): string | null {
  const first = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!first) return null;
  const mapped = MAPPED_IPV4.exec(first)?.[1];
  if (mapped) return mapped;
  if (!first.includes(":")) return first;
  return ipv6Prefix(first) ?? first;
}

export function noStoreJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export function providerUnavailable(error: {
  status?: number;
  name?: string;
}): boolean {
  return (
    error.name === "AuthRetryableFetchError" ||
    error.status === undefined ||
    error.status === 0 ||
    error.status === 429 ||
    error.status >= 500
  );
}

export function readPassword(value: unknown): string | null {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= SIGN_IN_PASSWORD_MAX_LENGTH
    ? value
    : null;
}

export function readEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim();
  return email && email.length <= SIGN_IN_EMAIL_MAX_LENGTH ? email : null;
}
