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
