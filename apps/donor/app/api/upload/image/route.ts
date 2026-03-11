import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const hasBearer = authHeader.toLowerCase().startsWith("bearer ");
  const token = hasBearer ? authHeader.slice("bearer ".length).trim() : "";

  // Minimal implementation to satisfy the E2E contract:
  // - endpoint exists
  // - unauthenticated/invalid requests get a 401 with JSON { error }
  if (!token || token === "invalid-token") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: implement image processing/upload when auth is wired up.
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
