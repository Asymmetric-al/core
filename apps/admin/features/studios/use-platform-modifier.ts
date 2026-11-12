"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const serverSnapshot = () => "Ctrl";
const browserSnapshot = () =>
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? "⌘" : "Ctrl";

/** Platform is stable for the session; the server snapshot keeps hydration consistent. */
export function usePlatformModifierLabel() {
  return useSyncExternalStore(subscribe, browserSnapshot, serverSnapshot);
}
