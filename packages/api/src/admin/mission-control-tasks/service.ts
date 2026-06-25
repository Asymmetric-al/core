import { resolveMissionControlTaskAssignment } from "./assignment-policy";
import { getSuggestedAttentionUrgency } from "./urgency";

import type {
  MissionControlIssueType,
  MissionControlLinkedRecord,
  MissionControlTaskAssignmentMode,
  MissionControlUrgency,
} from "./types";

export interface CreateMissionControlTaskInput {
  tenantId: string;
  source: string;
  issueType: MissionControlIssueType;
  title: string;
  description: string;
  actorProfileId: string | null;
  queueId: string;
  assignmentMode?: MissionControlTaskAssignmentMode;
  linkedRecords: MissionControlLinkedRecord[];
  urgency?: MissionControlUrgency;
  dueAt?: string | null;
  dependencies: {
    insertTask: (task: {
      tenantId: string;
      source: string;
      issueType: MissionControlIssueType;
      title: string;
      description: string;
      urgency: MissionControlUrgency;
      assigneeProfileId: string | null;
      queueId: string | null;
      dueAt: string | null;
      createdByProfileId: string | null;
      createdByKind: "human" | "system";
    }) => Promise<string>;
    insertLinks: (
      taskId: string,
      linkedRecords: MissionControlLinkedRecord[],
    ) => Promise<void>;
    appendEvent: (
      taskId: string,
      event: Record<string, unknown>,
    ) => Promise<void>;
  };
}

export async function createMissionControlTask(
  input: CreateMissionControlTaskInput,
) {
  const assignment = resolveMissionControlTaskAssignment({
    actorProfileId: input.actorProfileId,
    defaultQueueId: input.queueId,
    mode: input.assignmentMode,
  });
  const urgency =
    input.urgency ??
    getSuggestedAttentionUrgency({
      issueType: input.issueType,
      firstSeenAt: new Date().toISOString(),
    });
  const taskId = await input.dependencies.insertTask({
    tenantId: input.tenantId,
    source: input.source,
    issueType: input.issueType,
    title: input.title,
    description: input.description,
    urgency,
    assigneeProfileId: assignment.assigneeProfileId,
    queueId: assignment.queueId,
    dueAt: input.dueAt ?? null,
    createdByProfileId: input.actorProfileId,
    createdByKind: input.actorProfileId ? "human" : "system",
  });

  await input.dependencies.insertLinks(taskId, input.linkedRecords);
  await input.dependencies.appendEvent(taskId, {
    type: "created",
    issueType: input.issueType,
    urgency,
    linkedRecordCount: input.linkedRecords.length,
  });

  return { taskId, urgency };
}
