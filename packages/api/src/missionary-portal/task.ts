import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { runMissionaryPortalOperation } from "./route-helpers";
import { writeMissionaryTask } from "./service";
import { ensureJsonBody } from "../shared/http-errors";
import { missionaryScope } from "../shared/missionary-authority";
import { requireRouteUuid } from "../shared/route-uuid";

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
    sort_key: z.number().finite().transform(Math.round).optional(),
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
      const scope = missionaryScope(auth);
      const input = updateTaskSchema.parse(await ensureJsonBody(request));

      const task = await writeMissionaryTask(
        { supabaseAdmin, ...scope },
        "update",
        requireRouteUuid(taskId),
        taskUpdateFromInput(input),
      );

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
      await writeMissionaryTask(
        { supabaseAdmin, ...missionaryScope(auth) },
        "delete",
        requireRouteUuid(taskId),
      );

      return NextResponse.json({ success: true });
    },
  );
}
