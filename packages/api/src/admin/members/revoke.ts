import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiHttpError, ensureJsonBody } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

const revokeMembershipBodySchema = z.object({
  membershipId: z.string().uuid("A valid membership id is required"),
  reason: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "A reason is required")
    .refine((value) => value.length <= 500, "Reason is too long"),
});

interface RevokeMembershipRpcClient {
  rpc(
    fn: "revoke_membership",
    args: {
      p_tenant_id: string;
      p_membership_id: string;
      p_reason: string;
    },
  ): Promise<{
    data: Record<string, unknown> | null;
    error: { code?: string; message?: string } | null;
  }>;
}

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export const POST = withOperation(
  async ({ auth: ctx, request, sessionClient }) => {
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

    const parsed = revokeMembershipBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid revoke request" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const client = sessionClient as unknown as RevokeMembershipRpcClient;
    const { data, error } = await client.rpc("revoke_membership", {
      p_tenant_id: ctx.tenantId,
      p_membership_id: parsed.data.membershipId,
      p_reason: parsed.data.reason,
    });

    if (error || !data) {
      const status =
        error?.code === "42501"
          ? 403
          : error?.code === "P0002"
            ? 404
            : error?.code === "22023"
              ? 400
              : 500;
      return NextResponse.json(
        { error: error?.message || "Could not revoke membership" },
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
