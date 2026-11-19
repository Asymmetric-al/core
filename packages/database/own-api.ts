import {
  getDocumentScope,
  isDocumentScopeRetired,
  retireDocumentScope,
} from "./document-scope";
import {
  applyRequestScopeHeaders,
  retiredScopeResponse,
  SCOPE_REFUSED_HEADER,
} from "./request-scope-headers";

/**
 * The one way page code calls the app's own API routes (plan 5.2, "Calls from
 * a page to the app's own API carry the tenant too"; WP2b, AL-2675).
 *
 * It sends the document's tenant and assignment as the `x-asym-tenant` and
 * `x-asym-assignment` request headers, read from `getDocumentScope()` when
 * each call is made, and from nothing else: never the live address, never a
 * remembered value. `getAuthContext` passes them to the resolver as the
 * expected tenant and the proposed assignment, which it checks against the
 * caller's own live rows; they are proposals and nothing on the server trusts
 * them without that check. Without them the resolver refuses a person who
 * belongs to two organizations, or holds two staff rows in one, because it
 * never guesses.
 *
 * When the document has no scope (sign-in, the chooser, the public website,
 * any page outside the tenant segment that renders no scope of its own) the
 * call sends neither header. A value the caller set for either header is
 * always removed. When the document's scope is retired, the call is not sent
 * at all (JR1): it answers the server's refusal, made in the browser
 * (`retiredScopeResponse`).
 *
 * It lives in `@asym/database`, beside the document scope it reads, because
 * this is the lowest workspace package and every caller (the three apps,
 * `@asym/ui`, `@asym/lib`, `@asym/missionary`, `@asym/auth` and this
 * package's own collections and hooks) already depends on it. A lint rule in
 * `@asym/eslint-config` refuses a direct call to an own-API path anywhere
 * else.
 */

const OWN_API_PATH = /^\/api(?:[/?#]|$)/;

/** A path that is not one of the app's own API routes. */
export class OwnApiPathError extends TypeError {
  constructor(path: string) {
    super(
      `ownApiFetch calls only the app's own API, a path that starts with /api/; got "${path}".`,
    );
    this.name = "OwnApiPathError";
  }
}

function assertOwnApiPath(path: string): void {
  if (typeof path !== "string" || !OWN_API_PATH.test(path)) {
    throw new OwnApiPathError(String(path));
  }
}

/**
 * `fetch` for an own-API path (`/api/...`, relative to the document), with
 * the document's scope. The tenant headers never leave the app's origin: any
 * other address is refused before a request is made.
 *
 * Responses are never taken from the HTTP cache. The browser keys that cache
 * by address alone, while the same address answers for whichever tenant the
 * headers name.
 *
 * When the server refuses the tenant or assignment the request carried (the
 * `x-asym-scope-refused` header: the resolver's own refusal, never any other
 * 401 or 403), the document's scope is retired and the document reloads
 * once, where the proxy then decides (plan 5.2; AL-2675, JB1). The response
 * is still returned to the caller.
 */
export function ownApiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  // Refused before any request, synchronously, so the headers never leave.
  assertOwnApiPath(path);
  if (isDocumentScopeRetired()) {
    return Promise.resolve(retiredScopeResponse({ error: "Unauthorized" }));
  }
  const scope = getDocumentScope();
  const headers = applyRequestScopeHeaders(new Headers(init.headers), scope);
  const sent = fetch(path, {
    credentials: "same-origin",
    ...init,
    headers,
    cache: "no-store",
  });
  return Promise.resolve(sent).then((response) => {
    if (scope && response.headers.has(SCOPE_REFUSED_HEADER)) {
      retireDocumentScope();
    }
    return response;
  });
}

function fileNameFrom(response: Response, fallback: string): string {
  const disposition = response.headers.get("content-disposition") ?? "";
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      // Fall through to the plain form.
    }
  }
  return /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? fallback;
}

/**
 * A refused download. `message` is the route's own error text, for logs;
 * `status` lets a page tell the person in plain words what went wrong.
 */
export class OwnApiDownloadError extends Error {
  readonly status: number;

  constructor(status: number, routeMessage: string | null) {
    super(routeMessage ?? `Download failed with status ${status}`);
    this.name = "OwnApiDownloadError";
    this.status = status;
  }
}

/**
 * How long a downloaded file's `blob:` address stays readable after the click
 * (council round 1 on slice B, SB4). WebKit can still be reading it after the
 * click returns; a minute is long past that. The next download revokes the
 * previous address at once, so at most one stays.
 */
const FILE_ADDRESS_LIFETIME_MS = 60_000;

let lastFile: { url: string; timer: ReturnType<typeof setTimeout> } | null =
  null;

function releaseLastFile(): void {
  if (!lastFile) return;
  clearTimeout(lastFile.timer);
  URL.revokeObjectURL(lastFile.url);
  lastFile = null;
}

function keepFileAddress(url: string): void {
  releaseLastFile();
  const timer = setTimeout(() => {
    if (lastFile?.url === url) lastFile = null;
    URL.revokeObjectURL(url);
  }, FILE_ADDRESS_LIFETIME_MS);
  lastFile = { url, timer };
}

/**
 * Downloads a file an own-API route serves, through `ownApiFetch`. A link or
 * `window.open` to the route would be a page load, which carries no tenant
 * header, so a person in two organizations would be refused.
 *
 * Resolves once the browser has been handed the file; rejects with an
 * `OwnApiDownloadError` (the route's status and message) when it refuses.
 */
export async function ownApiDownload(
  path: string,
  options: { fileName?: string; signal?: AbortSignal } = {},
): Promise<void> {
  const response = await ownApiFetch(path, {
    signal: options.signal,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: unknown;
    } | null;
    throw new OwnApiDownloadError(
      response.status,
      typeof payload?.error === "string" && payload.error
        ? payload.error
        : null,
    );
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileNameFrom(response, options.fileName ?? "download");
    link.rel = "noopener";
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    keepFileAddress(url);
  }
}
