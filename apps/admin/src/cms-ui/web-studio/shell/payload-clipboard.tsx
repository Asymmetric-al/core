"use client";

import { registerClientSessionCleanup } from "@asym/auth/client-session";
import { useEffect } from "react";

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

export function PayloadClipboardGuard() {
  useEffect(() => {
    if (takeClipboardResetMark()) clearPayloadClipboard();
    return registerClientSessionCleanup(() => clearPayloadClipboard);
  }, []);
  return null;
}
