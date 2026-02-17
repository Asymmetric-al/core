import { NextResponse } from "next/server";

/** Read-only demo: no auth callback; redirect to app. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/donor-dashboard";
  return NextResponse.redirect(`${origin}${next}`);
}
