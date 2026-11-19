/**
 * Loads `href` as a new document, leaving nothing of the current Web Studio
 * document behind (AL-2675, council C1 and C12). Its own module so tests can
 * observe it: jsdom cannot navigate.
 *
 * Payload calls this only through the router adapter, for an address outside
 * Web Studio's pages. When the page holds unsaved changes, Payload's
 * leave-without-saving dialog has already asked the person and they chose to
 * leave; its `beforeunload` listener, still attached, would ask a second
 * time. The leave guard stops it for this load.
 */

import { loadDocument as loadNewDocument } from "@asym/database/document-reload";

const GUARD = Symbol.for("asym.webStudio.leaveGuard");

type GuardedWindow = Window & { [GUARD]?: true };

/**
 * Set once the person chose to leave; the document is going away. A page the
 * browser restores from its back/forward cache is the same document coming
 * back, so it asks again (council r2, minor).
 */
let leaving = false;

function stopSecondPrompt(event: Event) {
  if (leaving) event.stopImmediatePropagation();
}

function askAgainWhenRestored(event: Event) {
  if ((event as PageTransitionEvent).persisted) leaving = false;
}

/**
 * Installs the leave guard once per document. It must come before Payload's
 * own listener, which Payload adds when a form first holds a change: Chromium
 * runs a window's `beforeunload` listeners in the order they were added,
 * whatever their capture flag. The Web Studio document installs it as it
 * first renders, before any Payload form mounts.
 */
export function installWebStudioLeaveGuard(
  target: GuardedWindow = window,
): void {
  if (target[GUARD]) return;
  target.addEventListener("beforeunload", stopSecondPrompt, { capture: true });
  target.addEventListener("pageshow", askAgainWhenRestored);
  target[GUARD] = true;
}

export function loadDocument(
  href: string,
  { replace }: { replace: boolean },
): void {
  installWebStudioLeaveGuard();
  leaving = true;
  // The shared document load (slice B), which the tenant navigation rule
  // requires for every write of the address.
  loadNewDocument(href, { replace });
}
