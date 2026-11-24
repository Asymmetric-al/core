import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiHttpError, ensureJsonBody } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

const invitationIdSchema = z.string().uuid("A valid invitation id is required");

const revokeInvitationBodySchema = z.object({
  reason: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "A reason is required")
    .refine((value) => value.length <= 500, "Reason is too long"),
});

interface RevokeInvitationRpcClient {
  rpc(
    fn: "revoke_membership_invitation",
    args: {
      p_tenant_id: string;
      p_invitation_id: string;
      p_reason: string;
    },
  ): Promise<{
    data: Record<string, unknown> | null;
    error: { code?: string; message?: string } | null;
  }>;
}

type RevokeInvitationRouteContext = {
  params: Promise<{ invitationId: string }>;
};

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export const POST = withOperation<RevokeInvitationRouteContext>(
  async ({ auth: ctx, request, sessionClient }, routeContext) => {
    const rawParams = routeContext?.params ? await routeContext.params : null;
    const idParsed = invitationIdSchema.safeParse(rawParams?.invitationId);
    if (!idParsed.success) {
      return NextResponse.json(
        { error: idParsed.error.issues[0]?.message ?? "Invalid invitation id" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await ensureJsonBody(request);
    } catch (error) {
      if (error instanceof ApiHttpError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status, headers: NO_STORE_HEADERS },
        );
      }
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const parsed = revokeInvitationBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid revoke request" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const client = sessionClient as unknown as RevokeInvitationRpcClient;
    const { data, error } = await client.rpc("revoke_membership_invitation", {
      p_tenant_id: ctx.tenantId,
      p_invitation_id: idParsed.data,
      p_reason: parsed.data.reason,
    });

    if (error || !data) {
      const status =
        error?.code === "42501"
          ? 403
          : error?.code === "P0002"
            ? 404
            : error?.code === "55000"
              ? 409
              : error?.code === "22023" || error?.code === "22004"
                ? 400
                : 500;
      return NextResponse.json(
        { error: error?.message || "Could not revoke invitation" },
        { status, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { result: data },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  },
  { capability: "people.manage_members" },
);
