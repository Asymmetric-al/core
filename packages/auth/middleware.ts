import { NextResponse, type NextRequest } from "next/server";

export interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  authRoutes?: string[];
  loginPath?: string;
  redirectAuthenticatedTo?: string;
  allowApi?: boolean;
}

/** No-op: read-only demo has no auth. Passthrough only. */
export function createAuthMiddleware(_options: AuthMiddlewareOptions = {}) {
  return async function authMiddleware(request: NextRequest) {
    return NextResponse.next({ request });
  };
}
