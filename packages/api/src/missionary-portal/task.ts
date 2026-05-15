import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { runMissionaryPortalOperation } from "./route-helpers";
import { assertMissionaryDonorAccess, getMissionaryTask } from "./service";
import { ensureJsonBody } from "../shared/http-errors";

const taskStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "waiting",
  "completed",
  "deferred",
]);
const taskPrioritySchema = z.enum(["none", "low", "medium", "high"]);
const taskTypeSchema = z.enum([
  "call",
  "email",
  "to_do",
  "follow_up",
  "thank_you",
  "meeting",
]);

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(240).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    task_type: taskTypeSchema.optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    due_date: z.string().datetime().nullable().optional(),
    donor_id: z.string().uuid().nullable().optional(),
    sort_key: z.number().finite().optional(),
  })
  .strict();

function taskUpdateFromInput(input: z.infer<typeof updateTaskSchema>) {
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) {
    update.description = input.description ?? null;
  }
  if (input.task_type !== undefined) update.task_type = input.task_type;
  if (input.status !== undefined) {
    update.status = input.status;
    update.completed_at =
      input.status === "completed" ? new Date().toISOString() : null;
  }
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.due_date !== undefined) update.due_date = input.due_date;
  if (input.donor_id !== undefined) update.donor_id = input.donor_id;
  if (input.sort_key !== undefined) update.sort_key = input.sort_key;

  return update;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;

  return runMissionaryPortalOperation(
    request,
    async ({ supabaseAdmin, auth }) => {
      const input = updateTaskSchema.parse(await ensureJsonBody(request));

      if (input.donor_id) {
        await assertMissionaryDonorAccess({
          supabaseAdmin,
          donorId: input.donor_id,
          profileId: auth.profileId,
          tenantId: auth.tenantId,
        });
      }

      const { error } = await supabaseAdmin
        .from("missionary_tasks")
        .update(taskUpdateFromInput(input))
        .eq("id", taskId)
        .eq("missionary_id", auth.profileId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const task = await getMissionaryTask({
        supabaseAdmin,
        taskId,
        profileId: auth.profileId,
      });

      return NextResponse.json({ task });
    },
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;

  return runMissionaryPortalOperation(
    request,
    async ({ supabaseAdmin, auth }) => {
      const { error } = await supabaseAdmin
        .from("missionary_tasks")
        .delete()
        .eq("id", taskId)
        .eq("missionary_id", auth.profileId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    },
  );
}
