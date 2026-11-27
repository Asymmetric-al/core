import { NextResponse } from "next/server";

export const SIGN_IN_PASSWORD_MAX_LENGTH = 1024;
export const SIGN_IN_EMAIL_MAX_LENGTH = 320;

export function signInClientAddress(request: Request): string | null {
  const first = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first ? first : null;
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
