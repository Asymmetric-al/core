import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withOperation } from "../../shared/with-operation";
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
export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const parsed = retryRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid retry request." },
        { status: 400 },
      );
    }

    try {
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

      throw error;
    }
  },
  { roles: ["admin", "staff", "super_admin"] },
);
