import { NextResponse, type NextRequest } from "next/server";

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

function requestOrigin({ headers, nextUrl }: NextRequest): string | null {
  const authority = headers.get("host") ?? nextUrl.host;
  if (
    !["http:", "https:"].includes(nextUrl.protocol) ||
    !/^(?:[a-z\d.-]+|\[[a-f\d:.]+\])(?::\d+)?$/i.test(authority)
  )
    return null;
  try {
    return new URL(`${nextUrl.protocol}//${authority}`).origin;
  } catch {
    return null;
  }
}

function trustedSource(request: NextRequest, signed: boolean): boolean {
  const { headers } = request;
  const expected = requestOrigin(request);
  if (!expected) return false;
  const origin = headers.get("origin");
  if (origin !== null) return origin === expected;
  const site = headers.get("sec-fetch-site");
  if (site !== null && site !== "same-origin") return false;
  const referer = headers.get("referer");
  if (referer !== null) {
    try {
      return new URL(referer).origin === expected;
    } catch {
      return false;
    }
  }
  return (
    site === "same-origin" ||
    (!headers.has("cookie") &&
      (signed || /^Bearer \S+$/i.test(headers.get("authorization") ?? "")))
  );
}

export function admitApiMutation(
  request: NextRequest,
  path: string,
): NextResponse | null {
  if (!writes.has(request.method)) return null;
  const canonical = path.replace(/\/$/, "");
  const studio =
    canonical === "/web-studio/api" || canonical.startsWith("/web-studio/api/");
  if (!studio && !canonical.startsWith("/api/")) return null;
  const reject = (status: number, error: string) =>
    NextResponse.json(
      { error },
      { status, headers: { "cache-control": "no-store" } },
    );
  if (!trustedSource(request, signedRoutes.has(canonical)))
    return reject(403, "Mutation origin not accepted.");
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (
    !contentType &&
    request.body == null &&
    !request.headers.has("transfer-encoding") &&
    [null, "0"].includes(request.headers.get("content-length"))
  )
    return null;
  if (contentType === "application/json") return null;
  if (
    contentType === "multipart/form-data" &&
    (studio || uploads.has(canonical))
  )
    return null;
  return reject(415, "Unsupported mutation content type.");
}
