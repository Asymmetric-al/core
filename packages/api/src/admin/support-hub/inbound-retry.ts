import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "../../shared/http-errors";
import { requestInboundEmailRetryDispatch } from "../../workflows/adapters/inbound-email";

const retryRequestSchema = z
  .object({
    inboundEmailRowId: z.string().uuid(),
    kind: z.enum(["body", "attachments"]),
  })
  .strict();

/**
 * Staff retry for inbound email body or attachment retrieval. Authorization,
 * tenant scoping, product work claims, and workflow dispatch all run on the
 * server; the browser never calls the provider and never receives provider
 * secrets, signed URLs, raw payloads, or attachment bytes.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    requireRole(auth, ["admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const parsed = retryRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid retry request." },
        { status: 400 },
      );
    }

    const result = await requestInboundEmailRetryDispatch(
      { client: supabaseAdmin },
      {
        tenantId: ctx.tenantId,
        inboundEmailRowId: parsed.data.inboundEmailRowId,
        kind: parsed.data.kind,
        requestedBy: ctx.userId,
      },
    );

    return NextResponse.json({
      status: result.status,
      dispatch: result.dispatch,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "inbound_email_not_found" ||
        error.message === "inbound_email_tenant_mismatch")
    ) {
      // Same safe response for missing and cross-tenant rows.
      return NextResponse.json(
        { error: "Inbound email not found." },
        { status: 404 },
      );
    }

    return toErrorResponse(error);
  }
}
