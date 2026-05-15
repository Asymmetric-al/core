import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDonorPortalSnapshot, resolveDonorPortalContext } from "./service";
import { ensureJsonBody } from "../shared/http-errors";
import { withOperation } from "../shared/with-operation";

const donorPortalPatchSchema = z
  .object({
    firstName: z.string().trim().max(120).optional(),
    lastName: z.string().trim().max(120).optional(),
    displayName: z.string().trim().max(240).optional(),
    phone: z.string().trim().max(80).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    preferredContact: z.string().trim().max(40).optional(),
    receiptEmailFrequency: z.string().trim().max(40).optional(),
    defaultUpdateFrequency: z.string().trim().max(40).nullable().optional(),
    preferredLanguage: z.string().trim().max(20).optional(),
    doNotContact: z.boolean().optional(),
    doNotEmail: z.boolean().optional(),
    givingPreferences: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

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

export const GET = withOperation(
  async ({ supabaseAdmin, auth }) => {
    const ctx = auth as AuthenticatedContext;
    const portal = await getDonorPortalSnapshot({
      supabaseAdmin,
      profileId: ctx.profileId,
      tenantId: ctx.tenantId,
    });

    return NextResponse.json({ portal });
  },
  { roles: ["donor"] },
);

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
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        return NextResponse.json({ error: error.message }, { status: 500 });
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
