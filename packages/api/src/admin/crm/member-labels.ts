import { ApiHttpError } from "../../shared/http-errors";

import type { RequestSessionClient } from "../../shared/request-session-client";

export const CRM_LOOKUP_CHUNK_SIZE = 150;

type DirectoryClient = Pick<RequestSessionClient, "rpc">;
type DirectoryRow = {
  profile_id: string;
  display_name: string | null;
  email: string | null;
};

export async function loadCrmMemberLabels(
  client: DirectoryClient,
  tenantId: string,
  profileIds: readonly string[],
) {
  const ids = [...new Set(profileIds)];
  const labels = new Map(ids.map((id) => [id, "Former member"]));
  for (let offset = 0; offset < ids.length; offset += CRM_LOOKUP_CHUNK_SIZE) {
    const { data, error } = await client.rpc("tenant_member_directory", {
      p_tenant_id: tenantId,
      p_profile_ids: ids.slice(offset, offset + CRM_LOOKUP_CHUNK_SIZE),
    });
    if (error) throw new ApiHttpError(500, error.message);
    for (const row of (data ?? []) as DirectoryRow[]) {
      labels.set(row.profile_id, row.display_name || row.email || "Member");
    }
  }
  return labels;
}

export async function loadCrmMissionaryLabels(
  client: DirectoryClient,
  tenantId: string,
  missionaryIds: readonly string[],
) {
  const labels = new Map<string, string | null>();
  const ids = [...new Set(missionaryIds)];
  for (let offset = 0; offset < ids.length; offset += CRM_LOOKUP_CHUNK_SIZE) {
    const { data, error } = await client.rpc("crm_missionary_labels", {
      p_tenant_id: tenantId,
      p_ids: ids.slice(offset, offset + CRM_LOOKUP_CHUNK_SIZE),
    });
    if (error) throw new ApiHttpError(500, error.message);
    for (const row of (data ?? []) as Array<
      Omit<DirectoryRow, "profile_id"> & {
        id: string;
        profile_id: string | null;
        member_profile_id: string | null;
      }
    >) {
      const name = row.member_profile_id
        ? row.display_name || row.email || "Member"
        : "Former member";
      labels.set(row.id, row.profile_id ? name : null);
    }
  }
  return labels;
}
