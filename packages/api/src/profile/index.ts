import {
  getAuthContext,
  hasContextRole,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { checkProfileImageUrl } from "./image-url";
import { findFullProfileById } from "./queries";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../shared/http-errors";
import { findMissionaryByProfileId } from "../shared/queries";

const profilePatchSchema = z
  .object({
    firstName: z.string().trim().max(120).optional(),
    lastName: z.string().trim().max(120).optional(),
    displayName: z.string().trim().max(240).optional(),
    bio: z.string().trim().max(5000).nullable().optional(),
    tagline: z.string().trim().max(280).nullable().optional(),
    missionField: z.string().trim().max(240).nullable().optional(),
    location: z.string().trim().max(240).nullable().optional(),
    phone: z.string().trim().max(80).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    coverUrl: z.string().url().nullable().optional(),
    socialLinks: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

function fullNameFromProfilePatch(input: z.infer<typeof profilePatchSchema>) {
  if (input.displayName?.trim()) return input.displayName.trim();
  const parts = [input.firstName, input.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim());
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { data: profile, error: profileError } = await findFullProfileById(
      supabaseAdmin,
      ctx.profileId,
      ctx.tenantId,
    );

    if (profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );

    let profileData = { ...profile };

    if (hasContextRole(ctx, "missionary")) {
      const { data: missionary } = await findMissionaryByProfileId(
        supabaseAdmin,
        ctx.profileId,
      );

      if (missionary) {
        profileData = { ...profileData, missionary };
      }
    }

    return NextResponse.json({ profile: profileData });
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;
    const patch = profilePatchSchema.parse(await ensureJsonBody(request));
    const [storedAvatar, storedCover] = await Promise.all([
      typeof patch.avatarUrl === "string"
        ? supabaseAdmin
            .from("profiles")
            .select("avatar_url")
            .eq("id", ctx.profileId)
            .eq("tenant_id", ctx.tenantId)
            .maybeSingle()
        : null,
      typeof patch.coverUrl === "string"
        ? supabaseAdmin
            .from("missionaries")
            .select("cover_url")
            .eq("profile_id", ctx.profileId)
            .eq("tenant_id", ctx.tenantId)
            .maybeSingle()
        : null,
    ]);
    const lookupError = storedAvatar?.error ?? storedCover?.error;
    if (lookupError) throw new ApiHttpError(500, lookupError.message);
    // #2406: validated before any write; unchanged stored values are skipped.
    const owner = { tenantId: ctx.tenantId, userId: ctx.userId };
    const writeAvatar = checkProfileImageUrl(patch.avatarUrl, {
      ...owner,
      purpose: "avatars",
      stored: [storedAvatar?.data?.avatar_url],
    });
    const writeCover = checkProfileImageUrl(patch.coverUrl, {
      ...owner,
      purpose: "covers",
      stored: [storedCover?.data?.cover_url],
    });
    const now = new Date().toISOString();
    const profileUpdate: Record<string, unknown> = {};
    const missionaryUpdate: Record<string, unknown> = {};

    if (patch.firstName !== undefined) {
      profileUpdate.first_name = patch.firstName || null;
    }
    if (patch.lastName !== undefined) {
      profileUpdate.last_name = patch.lastName || null;
    }
    if (patch.displayName !== undefined) {
      profileUpdate.display_name = patch.displayName || null;
    }
    if (patch.phone !== undefined) {
      profileUpdate.phone = patch.phone || null;
      missionaryUpdate.phone = patch.phone || null;
    }
    if (writeAvatar) {
      profileUpdate.avatar_url = patch.avatarUrl || null;
    }

    const fullName = fullNameFromProfilePatch(patch);
    if (fullName !== undefined) {
      profileUpdate.full_name = fullName;
    }

    if (patch.bio !== undefined) missionaryUpdate.bio = patch.bio || null;
    if (patch.tagline !== undefined) {
      missionaryUpdate.tagline = patch.tagline || null;
    }
    if (patch.missionField !== undefined) {
      missionaryUpdate.mission_field = patch.missionField || null;
    }
    if (patch.location !== undefined) {
      missionaryUpdate.location = patch.location || null;
    }
    if (writeCover) {
      missionaryUpdate.cover_url = patch.coverUrl || null;
    }
    if (patch.socialLinks !== undefined) {
      missionaryUpdate.social_links = patch.socialLinks;
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

    if (Object.keys(missionaryUpdate).length > 0) {
      if (!hasContextRole(ctx, "missionary")) {
        return NextResponse.json(
          { error: "Missionary profile fields require missionary access" },
          { status: 403 },
        );
      }

      const { error } = await supabaseAdmin
        .from("missionaries")
        .update({ ...missionaryUpdate, updated_at: now })
        .eq("profile_id", ctx.profileId)
        .eq("tenant_id", ctx.tenantId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data: profile, error: profileError } = await findFullProfileById(
      supabaseAdmin,
      ctx.profileId,
      ctx.tenantId,
    );

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

    let profileData = { ...profile };

    if (hasContextRole(ctx, "missionary")) {
      const { data: missionary } = await findMissionaryByProfileId(
        supabaseAdmin,
        ctx.profileId,
      );

      if (missionary) {
        profileData = { ...profileData, missionary };
      }
    }

    return NextResponse.json({ profile: profileData });
  } catch (e) {
    return toErrorResponse(e);
  }
}
