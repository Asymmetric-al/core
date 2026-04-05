import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";

const locationSelect = `
  id,
  tenant_id,
  title,
  lat,
  lng,
  type,
  linked_id,
  summary,
  image_public_id,
  status,
  sort_key,
  created_at,
  updated_at
`;

const locationMutationSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(1, "Title is required"),
  lat: z
    .number()
    .finite("Latitude must be a number")
    .min(-90, "Latitude must be at least -90")
    .max(90, "Latitude must be at most 90"),
  lng: z
    .number()
    .finite("Longitude must be a number")
    .min(-180, "Longitude must be at least -180")
    .max(180, "Longitude must be at most 180"),
  type: z.enum(["missionary", "project", "custom"]),
  linked_id: z.string().trim().min(1).nullable().optional(),
  summary: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(["draft", "published"]),
});

const deleteLocationSchema = z.object({
  id: z.uuid(),
});

function getMissionaryFullName(
  profile: { full_name?: string } | { full_name?: string }[] | null,
) {
  if (Array.isArray(profile)) {
    return profile[0]?.full_name?.trim() || "Unnamed missionary";
  }

  return profile?.full_name?.trim() || "Unnamed missionary";
}

async function requireStaffContext(
  request?: Request,
): Promise<AuthenticatedContext> {
  const auth = await getAuthContext(request);
  requireRole(auth, ["staff", "admin", "super_admin"]);
  return auth as AuthenticatedContext;
}

function requireAdminSupabase() {
  const { client, error } = getAdminClient();

  if (!client) {
    throw new ApiHttpError(503, error || "Admin client unavailable");
  }

  return client;
}

function normalizeLocationMutation(
  input: z.infer<typeof locationMutationSchema>,
  tenantId: string,
) {
  return {
    tenant_id: tenantId,
    title: input.title,
    lat: input.lat,
    lng: input.lng,
    type: input.type,
    linked_id: input.type === "custom" ? null : (input.linked_id ?? null),
    summary: input.summary?.trim() ? input.summary.trim() : null,
    status: input.status,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = requireAdminSupabase();
    const ctx = await requireStaffContext(request);

    const [
      { data: locations, error: locationsError },
      { data: missionaries, error: missionariesError },
    ] = await Promise.all([
      supabaseAdmin
        .from("locations")
        .select(locationSelect)
        .eq("tenant_id", ctx.tenantId)
        .order("sort_key", { ascending: true })
        .order("title", { ascending: true }),
      supabaseAdmin
        .from("missionaries")
        .select("id, profile:profiles!missionaries_profile_id_fkey(full_name)")
        .eq("tenant_id", ctx.tenantId),
    ]);

    if (locationsError) {
      throw new ApiHttpError(500, locationsError.message);
    }

    if (missionariesError) {
      throw new ApiHttpError(500, missionariesError.message);
    }

    return NextResponse.json({
      locations: locations ?? [],
      linkedEntities: {
        missionaries: (missionaries ?? [])
          .map((missionary) => ({
            id: missionary.id,
            full_name: getMissionaryFullName(missionary.profile),
          }))
          .sort((left, right) => left.full_name.localeCompare(right.full_name)),
        projects: [],
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = requireAdminSupabase();
    const auth = await getAuthContext(request);
    requireRole(auth, ["staff", "admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const body = locationMutationSchema.parse(await ensureJsonBody(request));
    const payload = normalizeLocationMutation(body, ctx.tenantId);

    if (body.id) {
      const { data: location, error } = await supabaseAdmin
        .from("locations")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.id)
        .eq("tenant_id", ctx.tenantId)
        .select(locationSelect)
        .maybeSingle();

      if (error) {
        throw new ApiHttpError(500, error.message);
      }

      if (!location) {
        throw new ApiHttpError(404, "Location not found");
      }

      return NextResponse.json({ location });
    }

    const { data: location, error } = await supabaseAdmin
      .from("locations")
      .insert(payload)
      .select(locationSelect)
      .single();

    if (error) {
      throw new ApiHttpError(500, error.message);
    }

    return NextResponse.json({ location });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = requireAdminSupabase();
    const auth = await getAuthContext(request);
    requireRole(auth, ["staff", "admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const body = deleteLocationSchema.parse(await ensureJsonBody(request));

    const { data: deletedLocation, error } = await supabaseAdmin
      .from("locations")
      .delete()
      .eq("id", body.id)
      .eq("tenant_id", ctx.tenantId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new ApiHttpError(500, error.message);
    }

    if (!deletedLocation) {
      throw new ApiHttpError(404, "Location not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
