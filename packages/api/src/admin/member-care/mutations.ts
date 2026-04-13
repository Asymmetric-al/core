import { getAdminClient } from "@asym/database/supabase/admin";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export const threadPostSchema = z.object({
  personnelId: z.string().min(1),
  content: z.string().min(1),
  isPrivate: z.boolean().default(false),
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
  type: z.string().min(1),
  content: z.string().min(1),
  isPrivate: z.boolean().default(false),
});

export const careRequirementSchema = z.object({
  id: z.string().optional(),
  personnelId: z.string().min(1),
  activityType: z.string().min(1),
  intervalDays: z.number().int().positive(),
  notes: z.string().optional(),
});

export const manualAttentionSchema = z.object({
  personnelId: z.string().min(1),
  manualAttention: z.boolean(),
});

function getClient() {
  const { client, error } = getAdminClient();
  if (!client) throw new Error(error || "Admin client unavailable.");
  return client;
}

function revalidateMemberCareTags(tenantId: string): void {
  try {
    revalidateTag("member-care", "max");
    revalidateTag(`member-care:${tenantId}`, "max");
    revalidateTag("member-care:directory", "max");
    revalidateTag("member-care:activity", "max");
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

  const { data, error } = await client
    .from("activities")
    .insert({
      tenant_id: tenantId,
      entity_type: "missionary",
      entity_id: payload.personnelId,
      type: "pastoral_note",
      description: payload.content,
      author_id: actorId,
      author_name: "Staff",
      is_private: payload.isPrivate,
      date: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message || "Failed to create thread post.");
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

  const { data, error } = await client
    .from("care_goals")
    .upsert(
      {
        id: payload.id,
        tenant_id: tenantId,
        personnel_id: payload.personnelId,
        title: payload.title,
        status: payload.status,
        target_date: payload.targetDate ?? null,
        updated_by: actorId,
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

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
  const client = getClient();

  const { data, error } = await client
    .from("activities")
    .insert({
      tenant_id: tenantId,
      entity_type: "missionary",
      entity_id: payload.personnelId,
      type: payload.type,
      description: payload.content,
      author_id: actorId,
      author_name: "Staff",
      is_private: payload.isPrivate,
      date: new Date().toISOString(),
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
  const client = getClient();

  const { data, error } = await client
    .from("care_requirements")
    .upsert(
      {
        id: payload.id,
        tenant_id: tenantId,
        personnel_id: payload.personnelId,
        activity_type: payload.activityType,
        interval_days: payload.intervalDays,
        notes: payload.notes ?? null,
        updated_by: actorId,
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

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
