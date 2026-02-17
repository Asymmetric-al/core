import { NextRequest, NextResponse } from "next/server";

/** Read-only demo: admin comment updates disabled. */
export async function PATCH(
  _request: NextRequest,
  _context: { params: Promise<{ commentId: string }> },
) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}

/** Read-only demo: admin comment deletion disabled. */
export async function DELETE(
  _request: NextRequest,
  _context: { params: Promise<{ commentId: string }> },
) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
