import {
  buildNeedsAttentionGroups,
  mapNeedsAttentionRow,
  type NeedsAttentionRow,
} from "./read-model";
import { createMissionControlTask } from "./service";
import { asString, isRecord } from "../../shared/json-coerce";

import type {
  MissionControlIssueType,
  MissionControlLinkedRecord,
  MissionControlTaskAssignmentMode,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;

export async function ensureMissionControlQueue(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  key: string;
  name: string;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("mission_control_queues")
    .upsert(
      {
        tenant_id: input.tenantId,
        key: input.key,
        name: input.name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,key" },
    )
    .select("id")
    .single();

  if (error || !isRecord(data)) {
    throw new Error(
      error?.message ?? "Failed to ensure Mission Control queue.",
    );
  }

  return asString(data.id) ?? "";
}

export async function createMissionControlTaskInSupabase(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  title: string;
  description: string;
  issueType: MissionControlIssueType;
  actorProfileId: string | null;
  assignmentMode?: MissionControlTaskAssignmentMode;
  linkedRecords: MissionControlLinkedRecord[];
}) {
  const queueId = await ensureMissionControlQueue({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    key: "finance_operations",
    name: "Finance Operations",
  });

  return createMissionControlTask({
    tenantId: input.tenantId,
    source: "contribution_operations",
    issueType: input.issueType,
    title: input.title,
    description: input.description,
    actorProfileId: input.actorProfileId,
    queueId,
    assignmentMode: input.assignmentMode ?? "actor_and_queue",
    linkedRecords: input.linkedRecords,
    dependencies: {
      insertTask: async (task) => {
        const { data, error } = await input.supabaseAdmin
          .from("mission_control_tasks")
          .insert({
            tenant_id: task.tenantId,
            source_module: task.source,
            issue_type: task.issueType,
            title: task.title,
            description: task.description,
            urgency: task.urgency,
            assignee_profile_id: task.assigneeProfileId,
            queue_id: task.queueId,
            due_at: task.dueAt,
            created_by_profile_id: task.createdByProfileId,
            created_by_kind: task.createdByKind,
          })
          .select("id")
          .single();
        if (error || !isRecord(data)) {
          throw new Error(error?.message ?? "Failed to create task.");
        }
        return asString(data.id) ?? "";
      },
      insertLinks: async (taskId, records) => {
        if (records.length === 0) return;
        const { error } = await input.supabaseAdmin
          .from("mission_control_task_links")
          .insert(
            records.map((record) => ({
              tenant_id: input.tenantId,
              task_id: taskId,
              record_type: record.type,
              record_id: record.id,
              relationship: record.relationship ?? null,
              metadata: record.metadata ?? {},
            })),
          );
        if (error) throw new Error(error.message);
      },
      appendEvent: async (taskId, event) => {
        const { error } = await input.supabaseAdmin
          .from("mission_control_task_events")
          .insert({
            tenant_id: input.tenantId,
            task_id: taskId,
            actor_profile_id: input.actorProfileId,
            event_type: String(event.type ?? "created"),
            details: event,
          });
        if (error) throw new Error(error.message);
      },
    },
  });
}

export async function listContributionNeedsAttention(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("mission_control_attention_items")
    .select(
      "id, task_id, issue_type, urgency, status, summary, dedupe_key, first_seen_at, last_seen_at, details",
    )
    .eq("tenant_id", input.tenantId)
    .eq("status", "open")
    .order("last_seen_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const items = ((data ?? []) as NeedsAttentionRow[]).map(mapNeedsAttentionRow);

  return {
    groups: buildNeedsAttentionGroups(items),
    items,
  };
}
