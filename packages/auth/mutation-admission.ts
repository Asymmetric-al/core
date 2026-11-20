import { NextResponse, type NextRequest } from "next/server";

import {
  mutationMediaType,
  STUDIO_ORIGIN_REFUSAL,
  trustedMutationSource,
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

async function isEmptyWrite(request: Request): Promise<boolean> {
  if (request.headers.has("transfer-encoding")) return false;
  const length = request.headers.get("content-length");
  if (length !== null) return length === "0";
  if (!request.body) return true;
  const reader = request.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return true;
      if (value.byteLength) return false;
    }
  } catch {
    return false;
  } finally {
    reader.releaseLock();
  }
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
    return NextResponse.json(
      { error: "Invalid request path." },
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
  if (contentType === undefined && (await isEmptyWrite(request))) return null;
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
  return reject(415, "Unsupported mutation content type.");
}
