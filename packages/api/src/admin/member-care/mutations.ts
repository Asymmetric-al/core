import { getAdminClient } from "@asym/database/supabase/admin";
import { revalidateTag } from "next/cache";
import { z } from "zod";

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

const MEMBER_CARE_ACTIVITY_TYPE_FROM_DB = Object.fromEntries(
  Object.entries(MEMBER_CARE_ACTIVITY_TYPE_TO_DB).map(([label, dbValue]) => [
    dbValue,
    label,
  ]),
) as Record<
  (typeof MEMBER_CARE_ACTIVITY_TYPE_TO_DB)[keyof typeof MEMBER_CARE_ACTIVITY_TYPE_TO_DB],
  keyof typeof MEMBER_CARE_ACTIVITY_TYPE_TO_DB
>;

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

function toActivityLabel(
  value: z.infer<typeof activitySchema.shape.type>,
): MemberCareUiActivityType {
  return (
    MEMBER_CARE_ACTIVITY_TYPE_FROM_DB[value as MemberCareDbActivityType] ??
    (value as MemberCareUiActivityType)
  );
}

function getClient() {
  const { client, error } = getAdminClient();
  if (!client) throw new Error(error || "Admin client unavailable.");
  return client;
}

async function getActorNameSnapshot(
  client: ReturnType<typeof getClient>,
  actorId: string,
) {
  const { data, error } = await client
    .from("profiles")
    .select("display_name, full_name, first_name, last_name")
    .eq("user_id", actorId)
    .maybeSingle<{
      display_name: string | null;
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
    }>();

  if (error) {
    throw new Error(error.message || "Failed to resolve actor profile.");
  }

  return (
    data?.display_name?.trim() ||
    data?.full_name?.trim() ||
    [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim() ||
    actorId
  );
}

async function assertMissionaryOwnership(
  client: ReturnType<typeof getClient>,
  tenantId: string,
  missionaryId: string,
) {
  const { data, error } = await client
    .from("missionaries")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("id", missionaryId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to validate missionary.");
  }

  if (!data?.id) {
    throw new Error("Missionary not found.");
  }
}

function revalidateMemberCareTags(tenantId: string): void {
  try {
    revalidateTag("member-care", "max");
    revalidateTag(`member-care:${tenantId}`, "max");
    revalidateTag("member-care:directory", "max");
    revalidateTag("member-care:dashboard", "max");
    revalidateTag("member-care:activity", "max");
    revalidateTag("member-care:private-notes", "max");
  } catch {
    // noop outside Next.js runtime
  }
}

export type CreateCareThreadPostInput = z.infer<typeof threadPostSchema>;
export async function createCareThreadPost(
  tenantId: string,
  actorId: string,
  input: CreateCareThreadPostInput,
) {
  const payload = threadPostSchema.parse(input);
  const client = getClient();
  await assertMissionaryOwnership(client, tenantId, payload.personnelId);
  const actorNameSnapshot = await getActorNameSnapshot(client, actorId);

  const { data, error } = await client
    .from("member_care_activities")
    .insert({
      tenant_id: tenantId,
      missionary_id: payload.personnelId,
      type: "pastoral_note",
      title: "Care thread update",
      description: payload.content,
      author_user_id: actorId,
      author_name_snapshot: actorNameSnapshot,
      occurred_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message || "Failed to create thread post.");
  revalidateMemberCareTags(tenantId);
  return data;
}

export type CreateCarePrivateNoteInput = z.infer<typeof privateNoteSchema>;
export async function createCarePrivateNote(
  tenantId: string,
  actorId: string,
  input: CreateCarePrivateNoteInput,
) {
  const payload = privateNoteSchema.parse(input);
  const client = getClient();
  await assertMissionaryOwnership(client, tenantId, payload.personnelId);
  const actorNameSnapshot = await getActorNameSnapshot(client, actorId);

  const { data, error } = await client
    .from("member_care_private_notes")
    .insert({
      tenant_id: tenantId,
      missionary_id: payload.personnelId,
      author_user_id: actorId,
      author_name_snapshot: actorNameSnapshot,
      content: payload.content,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create private note.");
  }

  revalidateMemberCareTags(tenantId);
  return data;
}

export type UpsertCareGoalInput = z.infer<typeof careGoalSchema>;
export async function upsertCareGoal(
  tenantId: string,
  actorId: string,
  input: UpsertCareGoalInput,
) {
  const payload = careGoalSchema.parse(input);
  const client = getClient();
  await assertMissionaryOwnership(client, tenantId, payload.personnelId);

  const goalRecord = {
    tenant_id: tenantId,
    missionary_id: payload.personnelId,
    title: payload.title,
    status: payload.status,
    target_date: payload.targetDate ?? null,
    updated_by: actorId,
  };

  const query = payload.id
    ? client
        .from("member_care_goals")
        .update(goalRecord)
        .eq("tenant_id", tenantId)
        .eq("id", payload.id)
        .select("id")
        .single()
    : client.from("member_care_goals").insert(goalRecord).select("id").single();

  const { data, error } = await query;

  if (error) throw new Error(error.message || "Failed to upsert care goal.");
  revalidateMemberCareTags(tenantId);
  return data;
}

export type LogCareActivityInput = z.infer<typeof activitySchema>;
export async function logCareActivity(
  tenantId: string,
  actorId: string,
  input: LogCareActivityInput,
) {
  const payload = activitySchema.parse(input);
  const dbActivityType = toDbActivityType(payload.type);
  const activityLabel = toActivityLabel(payload.type);
  const client = getClient();
  await assertMissionaryOwnership(client, tenantId, payload.personnelId);
  const actorNameSnapshot = await getActorNameSnapshot(client, actorId);

  const { data, error } = await client
    .from("member_care_activities")
    .insert({
      tenant_id: tenantId,
      missionary_id: payload.personnelId,
      type: dbActivityType,
      title: activityLabel,
      description: payload.content,
      author_user_id: actorId,
      author_name_snapshot: actorNameSnapshot,
      occurred_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message || "Failed to log care activity.");
  revalidateMemberCareTags(tenantId);
  return data;
}

export type UpsertCareRequirementInput = z.infer<typeof careRequirementSchema>;
export async function upsertCareRequirement(
  tenantId: string,
  actorId: string,
  input: UpsertCareRequirementInput,
) {
  const payload = careRequirementSchema.parse(input);
  const dbActivityType = toDbActivityType(payload.activityType);
  const client = getClient();
  await assertMissionaryOwnership(client, tenantId, payload.personnelId);

  const requirementRecord = {
    tenant_id: tenantId,
    missionary_id: payload.personnelId,
    activity_type: dbActivityType,
    interval_days: payload.intervalDays,
    notes: payload.notes ?? null,
    updated_by: actorId,
  };

  const query = payload.id
    ? client
        .from("member_care_requirements")
        .update(requirementRecord)
        .eq("tenant_id", tenantId)
        .eq("id", payload.id)
        .select("id")
        .single()
    : client
        .from("member_care_requirements")
        .insert(requirementRecord)
        .select("id")
        .single();

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to upsert care requirement.");
  }

  revalidateMemberCareTags(tenantId);
  return data;
}

export type SetManualAttentionInput = z.infer<typeof manualAttentionSchema>;
export async function setManualAttentionFlag(
  tenantId: string,
  input: SetManualAttentionInput,
) {
  const payload = manualAttentionSchema.parse(input);
  const client = getClient();

  const { data, error } = await client
    .from("missionaries")
    .update({ manual_attention: payload.manualAttention })
    .eq("tenant_id", tenantId)
    .eq("id", payload.personnelId)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to set manual attention flag.");
  }

  revalidateMemberCareTags(tenantId);
  return data;
}
