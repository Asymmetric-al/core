import { reloadDocument } from "./document-reload";

/**
 * The one bounded reload every scope guard uses (council on the joined
 * release, JB2): the scope provider, the tenant segment's watcher and
 * reload, `TenantDocument`, and a retired scope (JB1). A tab reloads an
 * address at most once in `RELOAD_CLAIM_MS`, whatever renders in between,
 * so a fault that a reload does not cure (a page that renders and is then
 * refused every time) ends on a page with a way out instead of reloading for
 * ever (check of the fix lists, JR3). Each address keeps its own record, so
 * two addresses that send the tab to each other are bounded too.
 *
 * Its own module, beside `./document-reload`, which tests replace.
 */

/** This tab's memory of the reloads it tried: each address, and when. */
const RELOAD_CLAIM = "asym:document-reload";
/** How long a reload of an address counts as the one already tried. */
export const RELOAD_CLAIM_MS = 10_000;

function readClaims(now: number): Record<string, number> {
  const raw = window.sessionStorage.getItem(RELOAD_CLAIM);
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
 * Claims this tab's one reload of the current address: `false` when a
 * reload of it was already tried within `RELOAD_CLAIM_MS`, which would make
 * another one a loop. Without session storage a tab cannot remember the
 * reload, so it does not reload (a person whose browser refuses storage
 * cannot sign in either).
 */
export function claimDocumentReload(): boolean {
  const href = window.location.href;
  const now = Date.now();
  try {
    const claims = readClaims(now);
    if (href in claims) return false;
    claims[href] = now;
    window.sessionStorage.setItem(RELOAD_CLAIM, JSON.stringify(claims));
    return true;
  } catch {
    return false;
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
export function requestDocumentReload(): boolean {
  if (reloadBegun) return true;
  if (!claimDocumentReload()) return false;
  reloadBegun = true;
  reloadDocument();
  return true;
}
