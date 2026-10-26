import type { ActiveAssignment } from "./types";
import type { HumanProjectionContext } from "../projection/types";

/**
 * Maps a validated hat onto the projection resolver's `assignment` input.
 * `revision` and `currentRevision` are both the row's `updated_at` (OQ7) until
 * #670 gives the resolver a separate current epoch.
 */
export function toHumanProjectionAssignment(
  a: ActiveAssignment,
): HumanProjectionContext["assignment"] {
  return {
    id: a.assignmentId,
    revision: a.revision,
    currentRevision: a.revision,
    principalId: a.userId,
    tenantId: a.tenantId,
  };
}
