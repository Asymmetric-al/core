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
import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { listTenantMembers } from "../../shared/tenant-members";
import { withPlatformOperation } from "../../shared/with-operation";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

async function requireVerifiedMemoryTenant(input: {
  auth: AuthenticatedContext;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  // AL-2675 (NR-68): the profile must be the caller's own and their login a
  // live member of the request's tenant; the profile's tenant column is no authority.
  let bound = false;
  try {
    bound =
      (
        await listTenantMembers(input.supabaseAdmin, input.auth.tenantId, {
          profileIds: [input.auth.profileId],
          userIds: [input.auth.userId],
        })
      ).length > 0;
  } catch {
    bound = false;
  }

  if (!bound) {
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

export const GET = withPlatformOperation(
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
  { tenantAdministrator: true },
);

export const POST = withPlatformOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      await requireVerifiedMemoryTenant({ auth, supabaseAdmin });
      const parsed = createEveAdminMemorySchema.parse(
        await ensureJsonBody(request),
      );
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
  { tenantAdministrator: true },
);

export const PATCH = withPlatformOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      await requireVerifiedMemoryTenant({ auth, supabaseAdmin });
      const parsed = updateEveAdminMemorySchema.parse(
        await ensureJsonBody(request),
      );
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
  { tenantAdministrator: true },
);

export const DELETE = withPlatformOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      await requireVerifiedMemoryTenant({ auth, supabaseAdmin });
      const parsed = deleteEveAdminMemorySchema.parse(
        await ensureJsonBody(request),
      );
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
  { tenantAdministrator: true },
);
