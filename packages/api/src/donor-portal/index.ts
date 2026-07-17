import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { isE2EAuthBypassEnabled } from "@asym/auth/e2e-auth";
import { getAdminClient } from "@asym/database/supabase/admin";
import { NextResponse } from "next/server";

import { getDemoDonorPortalSnapshot } from "./demo-snapshot";
import { getDonorPortalSnapshot, resolveDonorPortalContext } from "./service";
import { donorPortalPatchSchema } from "./settings-patch";
import { ensureJsonBody, toErrorResponse } from "../shared/http-errors";
import { withOperation } from "../shared/with-operation";

import type { NextRequest } from "next/server";

const DONOR_PORTAL_UPDATE_ERROR = "Unable to update donor profile.";

function fullNameFromPatch(input: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
}) {
  if (input.displayName?.trim()) return input.displayName.trim();
  const parts = [input.firstName, input.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim());
  return parts.length > 0 ? parts.join(" ") : undefined;
}

function isSyntheticE2EContext(auth: AuthenticatedContext): boolean {
  return isE2EAuthBypassEnabled() && auth.userId.startsWith("e2e-");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();

  try {
    void request.headers.get("cookie");

    const authContext = await getAuthContext(request);
    requireRole(authContext, ["donor"]);
    const auth = authContext as AuthenticatedContext;

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      if (isSyntheticE2EContext(auth)) {
        return NextResponse.json({ portal: getDemoDonorPortalSnapshot() });
      }

      return NextResponse.json(
        { error: adminError, requestId },
        { status: 503 },
      );
    }

    const portal = await getDonorPortalSnapshot({
      supabaseAdmin,
      profileId: auth.profileId,
      tenantId: auth.tenantId,
    });

    return NextResponse.json({ portal });
  } catch (error) {
    return toErrorResponse(error, "Internal error", requestId);
  }
}

export const PATCH = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;
    const patch = donorPortalPatchSchema.parse(await ensureJsonBody(request));
    const { donor } = await resolveDonorPortalContext(
      supabaseAdmin,
      ctx.profileId,
      ctx.tenantId,
    );

    const now = new Date().toISOString();
    const profileUpdate: Record<string, unknown> = {};
    const donorUpdate: Record<string, unknown> = {};

    if (patch.firstName !== undefined) {
      profileUpdate.first_name = patch.firstName || null;
    }
    if (patch.lastName !== undefined) {
      profileUpdate.last_name = patch.lastName || null;
    }
    if (patch.displayName !== undefined) {
      profileUpdate.display_name = patch.displayName || null;
      donorUpdate.name = patch.displayName || null;
    }
    if (patch.phone !== undefined) {
      profileUpdate.phone = patch.phone || null;
      donorUpdate.phone = patch.phone || null;
    }
    if (patch.avatarUrl !== undefined) {
      profileUpdate.avatar_url = patch.avatarUrl || null;
      donorUpdate.avatar_url = patch.avatarUrl || null;
    }
    if (patch.preferredContact !== undefined) {
      donorUpdate.preferred_contact = patch.preferredContact;
    }
    if (patch.receiptEmailFrequency !== undefined) {
      donorUpdate.receipt_email_frequency = patch.receiptEmailFrequency;
    }
    if (patch.defaultUpdateFrequency !== undefined) {
      donorUpdate.default_update_frequency =
        patch.defaultUpdateFrequency || null;
    }
    if (patch.preferredLanguage !== undefined) {
      donorUpdate.preferred_language = patch.preferredLanguage;
    }
    if (patch.doNotContact !== undefined) {
      donorUpdate.do_not_contact = patch.doNotContact;
    }
    if (patch.doNotEmail !== undefined) {
      donorUpdate.do_not_email = patch.doNotEmail;
    }
    if (patch.givingPreferences !== undefined) {
      donorUpdate.giving_preferences = patch.givingPreferences;
    }

    const fullName = fullNameFromPatch(patch);
    if (fullName !== undefined) {
      profileUpdate.full_name = fullName;
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ ...profileUpdate, updated_at: now })
        .eq("id", ctx.profileId)
        .eq("tenant_id", ctx.tenantId);

      if (error) {
        console.error("[donor-portal] Profile update failed", error);
        return NextResponse.json(
          { error: DONOR_PORTAL_UPDATE_ERROR },
          { status: 500 },
        );
      }
    }

    if (Object.keys(donorUpdate).length > 0) {
      const { error } = await supabaseAdmin
        .from("donors")
        .update({ ...donorUpdate, updated_at: now })
        .eq("id", donor.id)
        .eq("tenant_id", ctx.tenantId)
        .eq("profile_id", ctx.profileId);

      if (error) {
        console.error("[donor-portal] Donor update failed", error);
        return NextResponse.json(
          { error: DONOR_PORTAL_UPDATE_ERROR },
          { status: 500 },
        );
      }
    }

    const portal = await getDonorPortalSnapshot({
      supabaseAdmin,
      profileId: ctx.profileId,
      tenantId: ctx.tenantId,
    });

    return NextResponse.json({ portal });
  },
  { roles: ["donor"] },
);
