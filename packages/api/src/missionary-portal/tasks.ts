import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  assertMissionaryDonorAccess,
  getMissionaryTask,
  listMissionaryTasks,
} from "./service";
import { ensureJsonBody } from "../shared/http-errors";
import { withOperation } from "../shared/with-operation";

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

const createTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    description: z.string().trim().max(2000).nullable().optional(),
    task_type: taskTypeSchema.default("to_do"),
    status: taskStatusSchema.default("not_started"),
    priority: taskPrioritySchema.default("none"),
    due_date: z.string().datetime().nullable().optional(),
    donor_id: z.string().uuid().nullable().optional(),
    sort_key: z.number().finite().optional(),
  })
  .strict();

export const GET = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;
    const donorId = new URL(request.url).searchParams.get("donorId");
    if (donorId) {
      await assertMissionaryDonorAccess({
        supabaseAdmin,
        donorId,
        profileId: ctx.profileId,
        tenantId: ctx.tenantId,
      });
    }

    const tasks = await listMissionaryTasks({
      supabaseAdmin,
      profileId: ctx.profileId,
      donorId,
    });

    return NextResponse.json({ tasks });
  },
  { roles: ["missionary"] },
);

export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;
    const input = createTaskSchema.parse(await ensureJsonBody(request));

    if (input.donor_id) {
      await assertMissionaryDonorAccess({
        supabaseAdmin,
        donorId: input.donor_id,
        profileId: ctx.profileId,
        tenantId: ctx.tenantId,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("missionary_tasks")
      .insert({
        missionary_id: ctx.profileId,
        donor_id: input.donor_id ?? null,
        title: input.title,
        description: input.description ?? null,
        task_type: input.task_type,
        status: input.status,
        priority: input.priority,
        due_date: input.due_date ?? null,
        sort_key: input.sort_key ?? Date.now() / 1000,
        is_auto_generated: false,
        completed_at:
          input.status === "completed" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Unable to create task" },
        { status: 500 },
      );
    }

    const task = await getMissionaryTask({
      supabaseAdmin,
      taskId: data.id,
      profileId: ctx.profileId,
    });

    return NextResponse.json({ task }, { status: 201 });
  },
  { roles: ["missionary"] },
);
