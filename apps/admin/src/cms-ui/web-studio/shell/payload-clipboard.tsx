"use client";

import { useEffect } from "react";

export const PAYLOAD_CLIPBOARD_KEY = "_payloadClipboard";

export function clearPayloadClipboard(): void {
  try {
    globalThis.localStorage?.removeItem(PAYLOAD_CLIPBOARD_KEY);
  } catch {
    return;
  }
}

export function PayloadClipboardReset() {
  useEffect(() => {
    clearPayloadClipboard();
  }, []);
  return null;
}
