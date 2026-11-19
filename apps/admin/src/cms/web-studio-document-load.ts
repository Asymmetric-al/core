/**
 * Loads `href` as a new document, leaving nothing of the current Web Studio
 * document behind (AL-2675, council C1 and C12). Its own module so tests can
 * observe it: jsdom cannot navigate.
 *
 * Payload calls this only through the router adapter, for an address outside
 * Web Studio's pages. When the page holds unsaved changes, Payload's
 * leave-without-saving dialog has already asked the person and they chose to
 * leave; its `beforeunload` listener, still attached, would ask a second
 * time. The leave guard stops it for this load, and only for this load.
 *
 * The load goes through slice A's crossing load, which marks the task so a
 * `refresh()` Payload makes in it does not render the current page again on
 * the document that is going away (AR14; council on the joined release,
 * JC8).
 */

import { loadCrossing } from "@asym/auth/tenant-navigation";

const GUARD = Symbol.for("asym.webStudio.leaveGuard");

type GuardedWindow = Window & { [GUARD]?: true };

/**
 * Set when the person chose to leave, for the one load that choice began:
 * its `beforeunload`, which the browser dispatches as the load starts, in
 * the same task, is the one prompt stopped. The mark ends with that event,
 * or with the task if no such event came. A document still here afterwards
 * (Stop, Escape, a 204 or a download at the target, a page restored from the
 * back/forward cache) asks again before it is closed (council on the joined
 * release, JC4, as slice A's AR14 bounds its own mark).
 */
let leaving = false;

function stopSecondPrompt(event: Event) {
  if (!leaving) return;
  leaving = false;
  event.stopImmediatePropagation();
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
  setTimeout(() => {
    leaving = false;
  }, 0);
  // The shared document load (slice B), which the tenant navigation rule
  // requires for every write of the address, through slice A's crossing.
  loadCrossing(href, replace);
}
