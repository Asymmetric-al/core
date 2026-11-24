import { z } from "zod";

import { revalidateMemberCareCache } from "../../shared/cache-tags";

import type { RequestSessionClient } from "../../shared/request-session-client";

export const threadPostSchema = z.object({
  personnelId: z.string().min(1),
  content: z.string().min(1),
});

export const careGoalSchema = z.object({
  id: z.string().optional(),
  personnelId: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(["pending", "active", "completed"]).default("pending"),
  targetDate: z.string().optional(),
});

export const activitySchema = z.object({
  personnelId: z.string().min(1),
  type: z.union([
    z.enum([
      "Video Call",
      "In-Person Visit",
      "Check-in",
      "Pastoral Note",
      "Care Plan Update",
      "Crisis Intervention",
      "Birthday",
      "Prayer Request",
    ]),
    z.enum([
      "video_call",
      "in_person_visit",
      "check_in",
      "pastoral_note",
      "care_plan_update",
      "crisis_intervention",
      "birthday",
      "prayer_request",
    ]),
  ]),
  content: z.string().min(1),
});

export const privateNoteSchema = z.object({
  personnelId: z.string().min(1),
  content: z.string().min(1),
});

export const careRequirementSchema = z.object({
  id: z.string().optional(),
  personnelId: z.string().min(1),
  activityType: z.union([
    z.enum([
      "Video Call",
      "In-Person Visit",
      "Check-in",
      "Pastoral Note",
      "Care Plan Update",
      "Crisis Intervention",
      "Birthday",
      "Prayer Request",
    ]),
    z.enum([
      "video_call",
      "in_person_visit",
      "check_in",
      "pastoral_note",
      "care_plan_update",
      "crisis_intervention",
      "birthday",
      "prayer_request",
    ]),
  ]),
  intervalDays: z.number().int().positive(),
  notes: z.string().optional(),
});

export const manualAttentionSchema = z.object({
  personnelId: z.string().min(1),
  manualAttention: z.boolean(),
});

const MEMBER_CARE_ACTIVITY_TYPE_TO_DB = {
  "Video Call": "video_call",
  "In-Person Visit": "in_person_visit",
  "Check-in": "check_in",
  "Pastoral Note": "pastoral_note",
  "Care Plan Update": "care_plan_update",
  "Crisis Intervention": "crisis_intervention",
  Birthday: "birthday",
  "Prayer Request": "prayer_request",
} as const;

type MemberCareUiActivityType = keyof typeof MEMBER_CARE_ACTIVITY_TYPE_TO_DB;
type MemberCareDbActivityType =
  (typeof MEMBER_CARE_ACTIVITY_TYPE_TO_DB)[MemberCareUiActivityType];

function toDbActivityType(
  value: z.infer<typeof activitySchema.shape.type>,
): MemberCareDbActivityType {
  return (
    MEMBER_CARE_ACTIVITY_TYPE_TO_DB[value as MemberCareUiActivityType] ??
    (value as MemberCareDbActivityType)
  );
}

const PG_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const careCommandResultSchema = z.object({
  id: z.string().regex(PG_UUID_REGEX),
});

function parseCareCommandResult(data: unknown): { id: string } {
  const row = Array.isArray(data) ? data[0] : data;
  return careCommandResultSchema.parse(row);
}

function createCareCommandError(
  error: { code?: string } | null | undefined,
  fallbackMessage: string,
): Error & { code?: string } {
  const err = new Error(fallbackMessage) as Error & { code?: string };
  if (typeof error?.code === "string") {
    err.code = error.code;
  }
  return err;
}

export type CreateCareThreadPostInput = z.infer<typeof threadPostSchema>;
export async function createCareThreadPost(
  sessionClient: RequestSessionClient,
  tenantId: string,
  input: CreateCareThreadPostInput,
) {
  const payload = threadPostSchema.parse(input);
  const { data, error } = await sessionClient.rpc("create_care_thread_post", {
    p_personnel_id: payload.personnelId,
    p_content: payload.content,
  });

  if (error) {
    throw createCareCommandError(error, "Failed to create thread post.");
  }

  const result = parseCareCommandResult(data);
  revalidateMemberCareCache(tenantId);
  return result;
}

export type CreateCarePrivateNoteInput = z.infer<typeof privateNoteSchema>;
export async function createCarePrivateNote(
  sessionClient: RequestSessionClient,
  tenantId: string,
  input: CreateCarePrivateNoteInput,
) {
  const payload = privateNoteSchema.parse(input);
  const { data, error } = await sessionClient.rpc("create_care_private_note", {
    p_personnel_id: payload.personnelId,
    p_content: payload.content,
  });

  if (error) {
    throw createCareCommandError(error, "Failed to create private note.");
  }

  const result = parseCareCommandResult(data);
  revalidateMemberCareCache(tenantId);
  return result;
}

export type UpsertCareGoalInput = z.infer<typeof careGoalSchema>;
export async function upsertCareGoal(
  sessionClient: RequestSessionClient,
  tenantId: string,
  input: UpsertCareGoalInput,
) {
  const payload = careGoalSchema.parse(input);
  const { data, error } = await sessionClient.rpc("upsert_care_goal", {
    p_personnel_id: payload.personnelId,
    p_title: payload.title,
    p_status: payload.status,
    p_target_date: payload.targetDate || null,
    p_goal_id: payload.id ?? null,
  });

  if (error) {
    throw createCareCommandError(error, "Failed to upsert care goal.");
  }

  const result = parseCareCommandResult(data);
  revalidateMemberCareCache(tenantId);
  return result;
}

export type LogCareActivityInput = z.infer<typeof activitySchema>;
export async function logCareActivity(
  sessionClient: RequestSessionClient,
  tenantId: string,
  input: LogCareActivityInput,
) {
  const payload = activitySchema.parse(input);
  const { data, error } = await sessionClient.rpc("log_care_activity", {
    p_personnel_id: payload.personnelId,
    p_type: toDbActivityType(payload.type),
    p_content: payload.content,
  });

  if (error) {
    throw createCareCommandError(error, "Failed to log care activity.");
  }

  const result = parseCareCommandResult(data);
  revalidateMemberCareCache(tenantId);
  return result;
}

export type UpsertCareRequirementInput = z.infer<typeof careRequirementSchema>;
export async function upsertCareRequirement(
  sessionClient: RequestSessionClient,
  tenantId: string,
  input: UpsertCareRequirementInput,
) {
  const payload = careRequirementSchema.parse(input);
  const { data, error } = await sessionClient.rpc("upsert_care_requirement", {
    p_personnel_id: payload.personnelId,
    p_activity_type: toDbActivityType(payload.activityType),
    p_interval_days: payload.intervalDays,
    p_notes: payload.notes ?? null,
    p_requirement_id: payload.id ?? null,
  });

  if (error) {
    throw createCareCommandError(error, "Failed to upsert care requirement.");
  }

  const result = parseCareCommandResult(data);
  revalidateMemberCareCache(tenantId);
  return result;
}

export type SetManualAttentionInput = z.infer<typeof manualAttentionSchema>;
export async function setManualAttentionFlag(
  sessionClient: RequestSessionClient,
  tenantId: string,
  input: SetManualAttentionInput,
) {
  const payload = manualAttentionSchema.parse(input);
  const { data, error } = await sessionClient.rpc("set_manual_attention_flag", {
    p_personnel_id: payload.personnelId,
    p_manual_attention: payload.manualAttention,
  });

  if (error) {
    throw createCareCommandError(error, "Failed to set manual attention flag.");
  }

  const result = parseCareCommandResult(data);
  revalidateMemberCareCache(tenantId);
  return result;
}
