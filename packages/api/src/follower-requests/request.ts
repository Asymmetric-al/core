import { NextRequest, NextResponse } from "next/server";

/** Read-only demo: follower request updates disabled. */
export async function PATCH(
  _request: NextRequest,
  _context: { params: Promise<{ requestId: string }> },
) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}

/** Read-only demo: follower request deletion disabled. */
export async function DELETE(
  _request: NextRequest,
  _context: { params: Promise<{ requestId: string }> },
) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
