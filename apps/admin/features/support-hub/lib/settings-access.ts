import type { SupportSavedView } from "@asym/database/hooks";

/**
 * What the signed-in user may change in per-agent settings, as the server
 * reports it with each list. The server enforces the same rules; this only
 * keeps the page from offering changes it would refuse.
 */
export type SupportSettingsAccess = {
  agentId: string | null;
  canManageAll: boolean;
};

/** Until the server answers, offer nothing that needs permission. */
export const NO_SUPPORT_SETTINGS_ACCESS: SupportSettingsAccess = {
  agentId: null,
  canManageAll: false,
};

export function canManageSavedView(
  access: SupportSettingsAccess,
  view: Pick<SupportSavedView, "scope" | "ownerAgentId">,
): boolean {
  if (access.canManageAll) return true;
  return (
    access.agentId !== null &&
    view.scope === "personal" &&
    view.ownerAgentId === access.agentId
  );
}
