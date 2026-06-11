import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withOperation } from "../../shared/with-operation";

const overridesSchema = z
  .object({
    urgentOnRetry: z.array(z.string().min(1).max(64)).max(16).optional(),
    muteFailed: z.array(z.string().min(1).max(64)).max(16).optional(),
  })
  .strict();

/** Tenant admins read the current workflow notification overrides. */
export const GET = withOperation(
  async ({ supabaseAdmin, auth }) => {
    const ctx = auth as AuthenticatedContext;

    const { data } = await supabaseAdmin
      .from("workflow_notification_policies")
      .select("overrides")
      .eq("tenant_id", ctx.tenantId)
      .maybeSingle();

    return NextResponse.json({ overrides: data?.overrides ?? {} });
  },
  { roles: ["admin", "super_admin"] },
);

/**
 * Tenant admins adjust notification behavior. Only bounded override knobs
 * are accepted; the quiet defaults stay in code so adjustments cannot make
 * the default noisy for everyone.
 */
export const PUT = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const parsed = overridesSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid notification policy." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("workflow_notification_policies")
      .upsert(
        {
          tenant_id: ctx.tenantId,
          overrides: parsed.data,
          updated_by_profile_id: ctx.userId,
        },
        { onConflict: "tenant_id" },
      );

    if (error) {
      return NextResponse.json(
        { error: "Could not save the notification policy." },
        { status: 503 },
      );
    }

    return NextResponse.json({ saved: true, overrides: parsed.data });
  },
  { roles: ["admin", "super_admin"] },
);
