import { reloadDocument } from "./document-reload";

/**
 * The one bounded reload every scope guard uses (council on the joined
 * release, JB2): the scope provider, the tenant segment's watcher and
 * reload, `TenantDocument`, and a retired scope (JB1). A tab reloads an
 * address at most once in `RELOAD_CLAIM_MS`, so a fault that a reload does
 * not cure ends on a page with a way out instead of reloading for ever.
 * Each address keeps its own record.
 *
 * Two causes, bounded differently (check of the fix lists, JR3):
 *
 * - `"crossing"`: a navigation that landed outside the document's scope.
 *   The new document cures it, so a document that renders in its scope
 *   forgets these claims (`forgetDocumentReload`), and switching
 *   organization twice in a few seconds reloads both times. And the claim
 *   stops only the document its own reload loaded: that document meeting
 *   the crossing again is the loop. A document the person navigated to (a
 *   link, an address, the history) makes a new crossing, so a reloaded page
 *   left before it hydrated, which never rendered and never forgot its
 *   claim, does not leave the next switch on the notice (Web Studio's suite
 *   on a production build, after the develop merge). Where the browser
 *   cannot say how the document was loaded, the claim stops it, as before.
 * - `"refused"`: the server refused the scope, or another person signed in.
 *   A page that renders and is then refused every time would claim, reload,
 *   render and forget for ever, so this claim is kept for the window
 *   whatever renders.
 *
 * Its own module, beside `./document-reload`, which tests replace.
 */

/** Why a guard asks for the reload. */
export type DocumentReloadCause = "crossing" | "refused";

/** This tab's memory of the reloads it tried, by cause: each address, and when. */
const RELOAD_CLAIMS: Record<DocumentReloadCause, string> = {
  crossing: "asym:document-reload",
  refused: "asym:document-reload-refused",
};
/** How long a reload of an address counts as the one already tried. */
export const RELOAD_CLAIM_MS = 30_000;

function readClaims(key: string, now: number): Record<string, number> {
  const raw = window.sessionStorage.getItem(key);
  const parsed: unknown = raw ? JSON.parse(raw) : null;
  const claims: Record<string, number> = {};
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    for (const [href, at] of Object.entries(parsed)) {
      if (typeof at === "number" && now - at < RELOAD_CLAIM_MS) {
        claims[href] = at;
      }
    }
  }
  return claims;
}

/**
 * Whether a reload loaded this document, from the navigation timing entry:
 * `false` when the person navigated to it, `null` where the browser cannot
 * say.
 */
function loadedByReload(): boolean | null {
  try {
    const [entry] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    return entry?.type ? entry.type === "reload" : null;
  } catch {
    return null;
  }
}

/**
 * Claims this tab's one reload of the current address for `cause`: `false`
 * when a reload of it for that cause was already tried within
 * `RELOAD_CLAIM_MS` (and, for a crossing, no document has rendered in its
 * scope since and this document is not one the person navigated to), which
 * would make another one a loop. Without session storage a tab cannot
 * remember the reload, so it does not reload (a person whose browser refuses
 * storage cannot sign in either).
 */
export function claimDocumentReload(
  cause: DocumentReloadCause = "crossing",
): boolean {
  const href = window.location.href;
  const now = Date.now();
  try {
    const key = RELOAD_CLAIMS[cause];
    const claims = readClaims(key, now);
    const newCrossing = cause === "crossing" && loadedByReload() === false;
    if (href in claims && !newCrossing) return false;
    claims[href] = now;
    window.sessionStorage.setItem(key, JSON.stringify(claims));
    return true;
  } catch {
    return false;
  }
}

/**
 * A document rendered in its scope: a later crossing of any address is a
 * new one. A refused scope's claims stay for their window (JR3).
 */
export function forgetDocumentReload(): void {
  try {
    window.sessionStorage.removeItem(RELOAD_CLAIMS.crossing);
  } catch {
    // Nothing was remembered.
  }
}

/** Whether this document has begun its reload: one per document. */
let reloadBegun = false;

/**
 * Reloads the document if this tab may (`claimDocumentReload`); `false`
 * when the bound is reached, and the caller then offers a way out.
 *
 * The one owner of the claim (check of the fix lists, JR10): a document
 * claims and begins at most one reload, and every guard that asks again,
 * such as `TenantDocument` after the segment's watcher on the same
 * crossing, is told it is under way instead of finding the claim taken.
 */
export function requestDocumentReload(
  cause: DocumentReloadCause = "crossing",
): boolean {
  if (reloadBegun) return true;
  if (!claimDocumentReload(cause)) return false;
  reloadBegun = true;
  reloadDocument();
  return true;
}
