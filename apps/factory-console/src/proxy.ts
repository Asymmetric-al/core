import { NextResponse } from "next/server";

import { authorize, configuration } from "./server/security";

export function proxy(request: Request) {
  try {
    return authorize(request, configuration()) ?? NextResponse.next();
  } catch {
    return Response.json(
      {
        error:
          "Console configuration unavailable. Owner must configure the private loopback instance.",
      },
      { status: 503 },
    );
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
