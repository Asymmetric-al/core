import {
  getAuthContext,
  hasContextRoleClass,
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
  toApiHttpError,
} from "../shared/http-errors";
import {
  missionaryScope,
  missionaryArgs,
} from "../shared/missionary-authority";
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
    const scope = hasContextRoleClass(ctx, "missionary")
      ? missionaryScope(ctx)
      : null;

    const { data: profile, error: profileError } = await findFullProfileById(
      supabaseAdmin,
      ctx.profileId,
    );

    if (profileError) throw toApiHttpError(profileError, profileError.message);

    let profileData = { ...profile };

    if (scope) {
      const { data: missionary, error } = await findMissionaryByProfileId(
        supabaseAdmin,
        scope,
      );
      if (error) throw toApiHttpError(error, error.message);

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
    const scope = hasContextRoleClass(ctx, "missionary")
      ? missionaryScope(ctx)
      : null;
    const patch = profilePatchSchema.parse(await ensureJsonBody(request));
    const [storedAvatar, storedCover] = await Promise.all([
      typeof patch.avatarUrl === "string"
        ? supabaseAdmin
            .from("profiles")
            .select("avatar_url")
            .eq("id", ctx.profileId)
            .maybeSingle()
        : null,
      typeof patch.coverUrl === "string" && scope
        ? supabaseAdmin
            .rpc("missionary_own_record", missionaryArgs(scope))
            .select("cover_url")
            .maybeSingle()
        : null,
    ]);
    const lookupError = storedAvatar?.error ?? storedCover?.error;
    if (lookupError) throw toApiHttpError(lookupError, lookupError.message);
    // #2406: validated before any write; unchanged stored values are skipped.
    // The avatar lookup is the caller's profile id. A tenant filter misses a
    // tenantless super_admin, whose auth tenant is the demo fallback.
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
      if (scope) missionaryUpdate.phone = patch.phone || null;
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

    if (Object.keys(missionaryUpdate).length > 0) {
      if (!scope)
        throw new ApiHttpError(
          403,
          "Missionary profile fields require missionary access",
        );
      const { data, error } = await supabaseAdmin
        .rpc("missionary_own_record_write", {
          ...missionaryArgs(scope),
          p_patch: missionaryUpdate,
        })
        .select("id")
        .maybeSingle();
      if (error) throw toApiHttpError(error, error.message);
      if (
        !data &&
        Object.keys(missionaryUpdate).some((field) => field !== "phone")
      )
        throw new ApiHttpError(404, "Missionary record not found");
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ ...profileUpdate, updated_at: now })
        // The caller's own profile; the tenant is the resolved assignment's.
        // A profile's tenant column is no authority (AL-2675, NR-68).
        .eq("id", ctx.profileId);

      if (error) throw toApiHttpError(error, error.message);
    }

    // Reload by the caller's profile id; a profile's tenant column is no
    // authority (AL-2675).
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", ctx.profileId)
      .single();

    if (profileError) throw toApiHttpError(profileError, profileError.message);

    let profileData = { ...profile };

    if (scope) {
      const { data: missionary, error } = await findMissionaryByProfileId(
        supabaseAdmin,
        scope,
      );
      if (error) throw toApiHttpError(error, error.message);

      if (missionary) {
        profileData = { ...profileData, missionary };
      }
    }

    return NextResponse.json({ profile: profileData });
  } catch (e) {
    return toErrorResponse(e);
  }
}
