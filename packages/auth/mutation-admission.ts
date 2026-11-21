import { NextResponse, type NextRequest } from "next/server";

import {
  mutationMediaType,
  STUDIO_ORIGIN_REFUSAL,
  trustedMutationSource,
  UNSUPPORTED_MUTATION_TYPE,
} from "./request-headers";

const writes = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const signedRoutes = new Set([
  "/api/webhooks/stripe",
  "/api/email/webhooks/resend",
  "/api/inngest",
]);
const uploads = new Set([
  "/api/upload/editor-image",
  "/api/upload/image",
  "/api/email/assets/upload",
]);

/**
 * An untyped write is empty by its framing headers alone: no transfer
 * encoding, and a length of zero or none. Next hands the proxy a body stream
 * for every write, so the stream says nothing. Next serves HTTP/1.1, where a
 * request with neither header has no body (RFC 9112, section 6.3): the bytes
 * after its headers are parsed as the next request, never read by a route.
 */
function isEmptyWrite(request: Request): boolean {
  if (request.headers.has("transfer-encoding")) return false;
  const length = request.headers.get("content-length");
  return length === null || length === "0";
}

export async function admitApiMutation(
  request: NextRequest,
  path: string,
): Promise<NextResponse | null> {
  if (!writes.has(request.method)) return null;
  let canonical: string;
  try {
    canonical = decodeURIComponent(path).replace(/\/$/, "");
  } catch {
    // On a Web Studio path, in Payload's error shape like every other
    // refusal there (fix check M4).
    const message = "Invalid request path.";
    return NextResponse.json(
      /^\/web-studio\/api(?:\/|$)/.test(path)
        ? { errors: [{ message }] }
        : { error: message },
      { status: 400 },
    );
  }
  const studio =
    canonical === "/web-studio/api" || canonical.startsWith("/web-studio/api/");
  if (!studio && !canonical.startsWith("/api/")) return null;
  const reject = (status: number, error: string) =>
    NextResponse.json(studio ? { errors: [{ message: error }] } : { error }, {
      status,
      headers: { "cache-control": "no-store" },
    });
  if (!trustedMutationSource(request, signedRoutes.has(canonical)))
    return reject(
      403,
      studio ? STUDIO_ORIGIN_REFUSAL : "Mutation origin not accepted.",
    );
  const contentType = mutationMediaType(request);
  if (contentType === undefined && isEmptyWrite(request)) return null;
  if (contentType === "application/json") return null;
  if (
    studio &&
    request.method === "POST" &&
    contentType === "application/x-www-form-urlencoded" &&
    request.headers.get("x-payload-http-method-override") === "GET"
  )
    return null;
  if (
    contentType === "multipart/form-data" &&
    (studio || uploads.has(canonical))
  )
    return null;
  return reject(415, UNSUPPORTED_MUTATION_TYPE);
}
