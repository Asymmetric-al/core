/**
 * Payload's REST routes under `/web-studio/api` (plan 5.2 and 6.3; AL-2675,
 * WP2b slice C): a request that changes data must be same-origin.
 *
 * Payload 4.0.0-beta.9 has a same-origin check of its own, the `csrf`
 * allowlist, but it guards only Payload's own `payload-token` cookie
 * (`payload/dist/auth/extractJWT.js`). Web Studio disables that local
 * strategy and signs people in from the Supabase session in its own strategy,
 * which Payload's check never sees. So the route adds the check, in the same
 * order Payload's uses: the `Origin` header when the browser sends one, else
 * `Sec-Fetch-Site`, else the `Referer`'s origin; a write that shows none of
 * them is refused, as Payload refuses one for its own cookie. Reads and
 * preflights pass to Payload unchanged.
 */

import { STUDIO_ORIGIN_REFUSAL } from "@asym/auth/request-headers";

type RouteHandler<Args> = (request: Request, args: Args) => Promise<Response>;

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export const CROSS_ORIGIN_WRITE_MESSAGE = STUDIO_ORIGIN_REFUSAL;

function originOf(value: string | null): string | null {
  if (!value || value === "null") return null;
  try {
    const { origin } = new URL(value);
    // An opaque origin (a `data:` or sandboxed document) serializes as the
    // string "null": no origin at all (council on the joined release, JC7).
    return origin === "null" ? null : origin;
  } catch {
    return null;
  }
}

/** A local server answers to both loopback names: same protocol and port counts as one origin. */
function isSameOrigin(
  requestOrigin: string,
  candidate: string | null,
): boolean {
  if (!candidate) return false;
  if (candidate === requestOrigin) return true;
  const a = new URL(requestOrigin);
  const b = new URL(candidate);
  return (
    a.protocol === b.protocol &&
    a.port === b.port &&
    LOOPBACK_HOSTS.has(a.hostname) &&
    LOOPBACK_HOSTS.has(b.hostname)
  );
}

export function isSameOriginWrite(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin !== null) return isSameOrigin(requestOrigin, originOf(origin));
  const site = request.headers.get("sec-fetch-site");
  if (site !== null) return site === "same-origin";
  return isSameOrigin(requestOrigin, originOf(request.headers.get("referer")));
}

/** Wraps one of Payload's route handlers: a cross-origin write never reaches it. */
export function sameOriginWrites<Args>(
  handler: RouteHandler<Args>,
): RouteHandler<Args> {
  return async (request, args) => {
    if (
      WRITE_METHODS.has(request.method.toUpperCase()) &&
      !isSameOriginWrite(request)
    ) {
      return Response.json(
        { errors: [{ message: CROSS_ORIGIN_WRITE_MESSAGE }] },
        { status: 403, headers: { "cache-control": "no-store" } },
      );
    }
    return handler(request, args);
  };
}
