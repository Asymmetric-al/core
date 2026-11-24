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

const inviteMemberBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("A valid email address is required")
      .max(320),
    role: z.enum(["staff", "missionary"]),
    staffRole: z.enum(STAFF_SUBROLES).nullable().optional(),
    isTenantAdmin: z.boolean().optional().default(false),
    reason: z
      .string()
      .transform((value) => value.trim())
      .refine((value) => value.length > 0, "A reason is required")
      .refine((value) => value.length <= 500, "Reason is too long"),
  })
  .superRefine((value, ctx) => {
    if (value.role === "staff" && !value.staffRole) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["staffRole"],
        message: "Select a staff sub-role.",
      });
    }
    if (value.role === "missionary" && value.staffRole) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["staffRole"],
        message: "Missionary invitations do not carry a staff sub-role.",
      });
    }
    if (value.role === "missionary" && value.isTenantAdmin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isTenantAdmin"],
        message: "Only staff invitations can grant administrator access.",
      });
    }
  });

export type MembershipInvitationSummary = {
  id: string;
  tenant_id: string;
  email: string;
  role: "staff" | "missionary";
  staff_role: string | null;
  is_tenant_admin: boolean;
  purpose: string;
  delivery_mode: string;
  status: "issued" | "accepted" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
};

type InviteMemberRpcResult = {
  invitation_id: string;
  tenant_id: string;
  selector: string;
  verifier: string;
  expires_at: string;
  role: "staff" | "missionary";
  staff_role: string | null;
  is_tenant_admin: boolean;
};

interface InvitationsRpcClient {
  rpc(
    fn: "tenant_membership_invitations",
    args: { p_tenant_id: string },
  ): Promise<{
    data: MembershipInvitationSummary[] | null;
    error: { code?: string; message?: string } | null;
  }>;
  rpc(
    fn: "invite_member",
    args: {
      p_tenant_id: string;
      p_email: string;
      p_role: string;
      p_staff_role: string | null;
      p_is_tenant_admin: boolean;
      p_reason: string;
    },
  ): Promise<{
    data: InviteMemberRpcResult | null;
    error: { code?: string; message?: string } | null;
  }>;
}

const INVITATION_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, no-transform, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
} as const;

export const GET = withOperation(
  async ({ auth: ctx, sessionClient }) => {
    const client = sessionClient as unknown as InvitationsRpcClient;
    const { data, error } = await client.rpc("tenant_membership_invitations", {
      p_tenant_id: ctx.tenantId,
    });
    if (error) {
      const status = error.code === "42501" ? 403 : 500;
      return NextResponse.json(
        {
          error:
            status === 403
              ? error.message || "Forbidden"
              : "Could not load invitations",
        },
        {
          status,
          headers: INVITATION_RESPONSE_HEADERS,
        },
      );
    }
    return NextResponse.json(
      { invitations: data ?? [] },
      { status: 200, headers: INVITATION_RESPONSE_HEADERS },
    );
  },
  { capability: "people.manage_members" },
);

export const POST = withOperation(
  async ({ auth: ctx, request, sessionClient }) => {
    let rawBody: unknown;
    try {
      rawBody = await ensureJsonBody(request);
    } catch (error) {
      if (error instanceof ApiHttpError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status, headers: INVITATION_RESPONSE_HEADERS },
        );
      }
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: INVITATION_RESPONSE_HEADERS },
      );
    }

    const parsed = inviteMemberBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid invitation details",
        },
        { status: 400, headers: INVITATION_RESPONSE_HEADERS },
      );
    }

    const client = sessionClient as unknown as InvitationsRpcClient;
    const { data, error } = await client.rpc("invite_member", {
      p_tenant_id: ctx.tenantId,
      p_email: parsed.data.email,
      p_role: parsed.data.role,
      p_staff_role:
        parsed.data.role === "staff" ? (parsed.data.staffRole ?? null) : null,
      p_is_tenant_admin:
        parsed.data.role === "staff" ? parsed.data.isTenantAdmin : false,
      p_reason: parsed.data.reason,
    });

    if (error || !data) {
      const status =
        error?.code === "42501"
          ? 403
          : error?.code === "22023" || error?.code === "22004"
            ? 400
            : 500;
      return NextResponse.json(
        {
          error:
            status >= 500
              ? "Could not create invitation"
              : error?.message || "Could not create invitation",
        },
        { status, headers: INVITATION_RESPONSE_HEADERS },
      );
    }

    return NextResponse.json(
      {
        invitation: data,
        invitePath: `/invite/${data.selector}#${data.verifier}`,
      },
      { status: 201, headers: INVITATION_RESPONSE_HEADERS },
    );
  },
  { capability: "people.manage_members" },
);
