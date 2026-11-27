import { isServeUnderPathsEnabled } from "@asym/database/document-reload";

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

export function markSharedOriginSessionChange<T extends NextResponse>(
  response: T,
): T {
  if (isServeUnderPathsEnabled()) response.cookies.set(clipboardResetCookie());
  return response;
}

export function markSharedBrowserSessionChange() {
  if (!isServeUnderPathsEnabled() || typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CLIPBOARD_RESET_COOKIE}=1; Path=/; SameSite=Lax${secure}`;
}
