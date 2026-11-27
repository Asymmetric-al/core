import type { NextResponse } from "next/server";

export const CLIPBOARD_RESET_COOKIE = "asym_clipboard_reset";

export function clipboardResetCookie() {
  return {
    name: CLIPBOARD_RESET_COOKIE,
    value: "1",
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function withClipboardReset<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    const response = await handler(...args);
    response.cookies.set(clipboardResetCookie());
    return response;
  };
}
