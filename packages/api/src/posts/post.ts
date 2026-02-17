import { NextRequest, NextResponse } from "next/server";

/** Read-only demo: post updates disabled. */
export async function PATCH(
  _request: NextRequest,
  _context: { params: Promise<{ postId: string }> },
) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}

/** Read-only demo: post deletion disabled. */
export async function DELETE(
  _request: NextRequest,
  _context: { params: Promise<{ postId: string }> },
) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
