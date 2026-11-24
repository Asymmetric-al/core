import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiHttpError, ensureJsonBody } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

const STAFF_SUBROLES = [
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
] as const;

const changeRoleBodySchema = z.object({
  membershipId: z.string().uuid("A valid membership id is required"),
  role: z.literal("staff"),
  staffRole: z.enum(STAFF_SUBROLES),
  isTenantAdmin: z.boolean(),
  reason: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "A reason is required")
    .refine((value) => value.length <= 500, "Reason is too long"),
  expectedUpdatedAt: z
    .string()
    .trim()
    .min(1, "The member's current version is required"),
});

interface ChangeRoleRpcClient {
  rpc(
    fn: "change_membership_role",
    args: {
      p_tenant_id: string;
      p_membership_id: string;
      p_role: "staff";
      p_staff_role: string;
      p_is_tenant_admin: boolean;
      p_reason: string;
      p_expected_updated_at: string;
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

    const parsed = changeRoleBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid role change input",
        },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const client = sessionClient as unknown as ChangeRoleRpcClient;
    const { data, error } = await client.rpc("change_membership_role", {
      p_tenant_id: ctx.tenantId,
      p_membership_id: parsed.data.membershipId,
      p_role: parsed.data.role,
      p_staff_role: parsed.data.staffRole,
      p_is_tenant_admin: parsed.data.isTenantAdmin,
      p_reason: parsed.data.reason,
      p_expected_updated_at: parsed.data.expectedUpdatedAt,
    });

    if (error || !data) {
      if (error?.code === "40001") {
        return NextResponse.json(
          {
            error:
              error.message ||
              "This membership was changed by someone else; reload and try again",
            code: "CONCURRENT_MODIFICATION",
          },
          { status: 409, headers: NO_STORE_HEADERS },
        );
      }
      if (error?.code === "23505") {
        return NextResponse.json(
          {
            error:
              error.message ||
              "This person already holds that role in this organization",
            code: "DUPLICATE_ROLE",
          },
          { status: 409, headers: NO_STORE_HEADERS },
        );
      }
      const status =
        error?.code === "42501"
          ? 403
          : error?.code === "P0002"
            ? 404
            : error?.code === "22023"
              ? 400
              : 500;
      return NextResponse.json(
        { error: error?.message || "Could not update member role" },
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
