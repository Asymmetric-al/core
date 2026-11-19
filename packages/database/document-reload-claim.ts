import { reloadDocument } from "./document-reload";

/**
 * The one bounded reload every scope guard uses (council on the joined
 * release, JB2): the scope provider, the tenant segment's watcher and
 * reload, `TenantDocument`, and a retired scope (JB1). A tab reloads an
 * address at most once in `RELOAD_CLAIM_MS` until a document renders there,
 * so a fault that a reload does not cure ends on a page with a way out
 * instead of reloading for ever.
 *
 * Its own module, beside `./document-reload`, which tests replace.
 */

/** This tab's memory of the reload it already tried. */
const RELOAD_CLAIM = "asym:document-reload";
/** How long a reload of the same address counts as the one already tried. */
export const RELOAD_CLAIM_MS = 30_000;

/**
 * Claims this tab's one reload of the current address: `false` when a
 * reload of it was already tried within `RELOAD_CLAIM_MS` and no document
 * has rendered since, which would make another one a loop. Without session
 * storage a tab cannot remember the reload, so it does not reload (a person
 * whose browser refuses storage cannot sign in either).
 */
export function claimDocumentReload(): boolean {
  const href = window.location.href;
  const now = Date.now();
  try {
    const raw = window.sessionStorage.getItem(RELOAD_CLAIM);
    const last = raw
      ? (JSON.parse(raw) as { href?: unknown; at?: unknown })
      : null;
    if (
      last &&
      last.href === href &&
      typeof last.at === "number" &&
      now - last.at < RELOAD_CLAIM_MS
    ) {
      return false;
    }
    window.sessionStorage.setItem(
      RELOAD_CLAIM,
      JSON.stringify({ href, at: now }),
    );
    return true;
  } catch {
    return false;
  }
}

/** A document rendered in its scope: a later reload of any address is a new one. */
export function forgetDocumentReload(): void {
  try {
    window.sessionStorage.removeItem(RELOAD_CLAIM);
  } catch {
    // Nothing was remembered.
  }
}

/**
 * Reloads the document if this tab may (`claimDocumentReload`); `false`
 * when the bound is reached, and the caller then offers a way out.
 */
export function requestDocumentReload(): boolean {
  if (!claimDocumentReload()) return false;
  reloadDocument();
  return true;
}
