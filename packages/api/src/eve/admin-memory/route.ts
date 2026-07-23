import { NextResponse } from "next/server";

import {
  createEveAdminMemory,
  deleteEveAdminMemory,
  setEveAdminMemoryAutoSave,
  updateEveAdminMemory,
} from "./control";
import {
  createEveAdminMemorySchema,
  deleteEveAdminMemorySchema,
  searchEveAdminMemorySchema,
  updateEveAdminMemorySchema,
} from "./schema";
import { loadEveAdminMemoryAdminView } from "./store";
import { ApiHttpError } from "../../shared/api-http-error";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

async function requireVerifiedMemoryTenant(input: {
  auth: AuthenticatedContext;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const { data: profile, error } = await input.supabaseAdmin
    .from("profiles")
    .select("tenant_id")
    .eq("id", input.auth.profileId)
    .eq("user_id", input.auth.userId)
    .single();

  if (
    error ||
    typeof profile?.tenant_id !== "string" ||
    profile.tenant_id !== input.auth.tenantId
  ) {
    throw new ApiHttpError(
      403,
      "Private memory requires a tenant-bound profile matching the authenticated tenant.",
    );
  }
}

function view(input: {
  auth: { profileId: string; tenantId: string };
  includeDeleted?: boolean;
  query?: string;
  supabaseAdmin: Parameters<
    typeof loadEveAdminMemoryAdminView
  >[0]["supabaseAdmin"];
}) {
  return loadEveAdminMemoryAdminView({
    ownerProfileId: input.auth.profileId,
    tenantId: input.auth.tenantId,
    includeDeleted: input.includeDeleted,
    query: input.query,
    supabaseAdmin: input.supabaseAdmin,
  });
}

export const GET = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      await requireVerifiedMemoryTenant({ auth, supabaseAdmin });
      const url = new URL(request.url);
      const search = searchEveAdminMemorySchema.parse({
        includeDeleted: url.searchParams.get("includeDeleted") ?? undefined,
        query: url.searchParams.get("query") ?? undefined,
      });
      return NextResponse.json({
        ...(await view({ auth, supabaseAdmin, ...search })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load private Eve memory.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      await requireVerifiedMemoryTenant({ auth, supabaseAdmin });
      const parsed = createEveAdminMemorySchema.parse(await request.json());
      const mutation = await createEveAdminMemory({
        auth,
        supabaseAdmin,
        ...parsed,
      });
      return NextResponse.json(
        { ...(await view({ auth, supabaseAdmin })), mutation, requestId },
        { status: mutation.stored ? 201 : 422 },
      );
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to create private Eve memory.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const PATCH = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      await requireVerifiedMemoryTenant({ auth, supabaseAdmin });
      const parsed = updateEveAdminMemorySchema.parse(await request.json());
      const mutation =
        parsed.action === "edit"
          ? await updateEveAdminMemory({ auth, supabaseAdmin, ...parsed })
          : (await setEveAdminMemoryAutoSave({
              auth,
              supabaseAdmin,
              ...parsed,
            }),
            { stored: true as const });
      return NextResponse.json(
        { ...(await view({ auth, supabaseAdmin })), mutation, requestId },
        { status: "stored" in mutation && !mutation.stored ? 422 : 200 },
      );
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to update private Eve memory.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const DELETE = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      await requireVerifiedMemoryTenant({ auth, supabaseAdmin });
      const parsed = deleteEveAdminMemorySchema.parse(await request.json());
      await deleteEveAdminMemory({ auth, supabaseAdmin, ...parsed });
      return NextResponse.json({
        ...(await view({ auth, supabaseAdmin })),
        mutation: { deleted: true },
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to delete private Eve memory.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);
