import { NextRequest, NextResponse } from "next/server";

/** Read-only demo: no-op so UI does not break if it still calls. */
export async function POST(
  _request: NextRequest,
  _context: { params: Promise<{ postId: string }> },
) {
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  _context: { params: Promise<{ postId: string }> },
) {
  return NextResponse.json({ success: true });
}
