"use client";

import {
  registerClientSessionCleanup,
  registerSessionChangeCleanup,
} from "@asym/auth/client-session";
import { useRoutePathname } from "@asym/auth/tenant-navigation";
import { Suspense, useEffect } from "react";

import { CLIPBOARD_RESET_COOKIE } from "../../../cms/clipboard-reset";

export const PAYLOAD_CLIPBOARD_KEY = "_payloadClipboard";

export function clearPayloadClipboard(): void {
  try {
    globalThis.localStorage?.removeItem(PAYLOAD_CLIPBOARD_KEY);
  } catch {
    return;
  }
}

function takeClipboardResetMark(): boolean {
  const marked = document.cookie
    .split(";")
    .some((pair) => pair.trim() === `${CLIPBOARD_RESET_COOKIE}=1`);
  if (marked) {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CLIPBOARD_RESET_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  }
  return marked;
}

export function PayloadClipboardReset() {
  useEffect(() => {
    clearPayloadClipboard();
  }, []);
  return null;
}

function PayloadClipboardMarkReader() {
  const pathname = useRoutePathname();
  useEffect(() => {
    if (takeClipboardResetMark()) clearPayloadClipboard();
  }, [pathname]);
  return null;
}

export function PayloadClipboardGuard() {
  useEffect(() => {
    const atSignOut = registerClientSessionCleanup(() => clearPayloadClipboard);
    const atSessionChange = registerSessionChangeCleanup(clearPayloadClipboard);
    return () => {
      atSignOut();
      atSessionChange();
    };
  }, []);
  return (
    <Suspense fallback={null}>
      <PayloadClipboardMarkReader />
    </Suspense>
  );
}
