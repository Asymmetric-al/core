import { getSuggestedAttentionUrgency } from "./urgency";

import type {
  MissionControlIssueType,
  MissionControlLinkedRecord,
  MissionControlUrgencyThresholds,
} from "./types";

export async function upsertNeedsAttentionItem(input: {
  tenantId: string;
  dedupeKey: string;
  issueType: MissionControlIssueType;
  summary: string;
  linkedRecords: MissionControlLinkedRecord[];
  firstSeenAt?: string;
  thresholds?: MissionControlUrgencyThresholds;
  dependencies: {
    upsert: (item: {
      tenantId: string;
      dedupeKey: string;
      issueType: MissionControlIssueType;
      summary: string;
      urgency: string;
      linkedRecords: MissionControlLinkedRecord[];
    }) => Promise<{
      attentionItemId: string;
      created: boolean;
    }>;
  };
}) {
  return input.dependencies.upsert({
    tenantId: input.tenantId,
    dedupeKey: input.dedupeKey,
    issueType: input.issueType,
    summary: input.summary,
    urgency: getSuggestedAttentionUrgency({
      issueType: input.issueType,
      firstSeenAt: input.firstSeenAt ?? new Date().toISOString(),
      thresholds: input.thresholds,
    }),
    linkedRecords: input.linkedRecords,
  });
}
