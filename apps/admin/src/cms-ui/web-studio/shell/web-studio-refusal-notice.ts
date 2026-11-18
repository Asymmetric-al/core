import { useSyncExternalStore } from "react";

import { isWebStudioRefusal } from "../../../cms/auth/web-studio-refusal";

import type { WebStudioRefusal } from "../../../cms/auth/web-studio-refusal";

/**
 * The refusal a Web Studio document asks the person about (AL-2675, council
 * C2). The document's fetch wrapper reports each refused response here; only
 * the first opens the notice, and once the person closes it no later refusal
 * opens it again, so the document asks once. Module state is the document's:
 * a reload starts it afresh.
 */
let asked = false;
let openRefusal: WebStudioRefusal | null = null;
/** The refusal the document met first; it stays after the dialog closes. */
let staleRefusal: WebStudioRefusal | null = null;
const listeners = new Set<() => void>();

function publish() {
  for (const listener of listeners) listener();
}

/**
 * Opens the notice for the refusal a response's header names, if none was
 * asked before. `true` when this refusal opened it.
 */
export function noticeWebStudioRefusal(header: string | null): boolean {
  if (asked || !isWebStudioRefusal(header)) return false;
  asked = true;
  openRefusal = header;
  staleRefusal = header;
  publish();
  return true;
}

/** Closes the notice for good in this document. */
export function dismissWebStudioRefusal(): void {
  if (openRefusal === null) return;
  openRefusal = null;
  publish();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The refusal the open notice is about, or `null` when none is open. */
export function useWebStudioRefusalNotice(): WebStudioRefusal | null {
  return useSyncExternalStore(
    subscribe,
    () => openRefusal,
    () => null,
  );
}

/**
 * The refusal the document met, once its dialog is closed: the page stays
 * stale, and one notice says so until it is reloaded (council r2 CR5).
 */
export function useWebStudioStaleRefusal(): WebStudioRefusal | null {
  return useSyncExternalStore(
    subscribe,
    () => (openRefusal === null ? staleRefusal : null),
    () => null,
  );
}
