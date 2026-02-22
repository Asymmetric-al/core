import {
  getAuthContext,
  requireAuth,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { NextResponse } from "next/server";

import { toApiHttpError } from "./http-errors";

import type { UserRole } from "@asym/database/types";
import type { NextRequest } from "next/server";

type AdminSupabaseClient = Exclude<
  ReturnType<typeof getAdminClient>["client"],
  null
>;

export interface OperationContext {
  supabaseAdmin: AdminSupabaseClient;
  auth: AuthenticatedContext;
  audit: ReturnType<typeof createAuditLogger>;
  request: NextRequest;
  requestId: string;
}

export interface OperationOptions {
  roles?: UserRole[];
}

export function withOperation(
  handler: (ctx: OperationContext) => Promise<NextResponse>,
  options?: OperationOptions,
): (request: NextRequest) => Promise<NextResponse> {
  return async function operationHandler(request: NextRequest) {
    const requestId = crypto.randomUUID();

    try {
      const { client: supabaseAdmin, error: adminError } = getAdminClient();
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: adminError, requestId },
          { status: 503 },
        );
      }

      const authContext = await getAuthContext();
      if (options?.roles) {
        requireRole(authContext, options.roles);
      } else {
        requireAuth(authContext);
      }

      const auth = authContext;
      const audit = createAuditLogger(auth, request);

      return handler({
        supabaseAdmin,
        auth,
        audit,
        request,
        requestId,
      });
    } catch (error) {
      const normalized = toApiHttpError(error);
      return NextResponse.json(
        { error: normalized.message, requestId },
        { status: normalized.status },
      );
    }
  };
}
