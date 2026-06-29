import type {
  MissionControlTaskAssignment,
  MissionControlTaskAssignmentMode,
} from "./types";

export function resolveMissionControlTaskAssignment(input: {
  actorProfileId: string | null;
  defaultQueueId: string;
  mode?: MissionControlTaskAssignmentMode;
}): MissionControlTaskAssignment {
  const mode = input.mode ?? "actor_and_queue";

  if (mode === "actor_only") {
    return {
      assigneeProfileId: input.actorProfileId,
      queueId: null,
    };
  }

  if (mode === "queue_only") {
    return {
      assigneeProfileId: null,
      queueId: input.defaultQueueId,
    };
  }

  return {
    assigneeProfileId: input.actorProfileId,
    queueId: input.defaultQueueId,
  };
}
