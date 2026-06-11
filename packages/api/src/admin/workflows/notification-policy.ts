import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "../../shared/http-errors";

const overridesSchema = z
  .object({
    urgentOnRetry: z.array(z.string().min(1).max(64)).max(16).optional(),
    muteFailed: z.array(z.string().min(1).max(64)).max(16).optional(),
  })
  .strict();

/** Tenant admins read the current workflow notification overrides. */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const { data } = await supabaseAdmin
      .from("workflow_notification_policies")
      .select("overrides")
      .eq("tenant_id", ctx.tenantId)
      .maybeSingle();

    return NextResponse.json({ overrides: data?.overrides ?? {} });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Tenant admins adjust notification behavior. Only bounded override knobs
 * are accepted; the quiet defaults stay in code so adjustments cannot make
 * the default noisy for everyone.
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

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
  } catch (error) {
    return toErrorResponse(error);
  }
}
