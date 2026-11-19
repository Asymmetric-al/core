import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeMissionaryTask, listMissionaryTasks } from "./service";
import { ensureJsonBody } from "../shared/http-errors";
import { missionaryScope } from "../shared/missionary-authority";
import { requireRouteUuid } from "../shared/route-uuid";
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
    sort_key: z.number().finite().transform(Math.round).optional(),
  })
  .strict();

export const GET = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;
    const donorId = new URL(request.url).searchParams.get("donorId");

    const tasks = await listMissionaryTasks({
      supabaseAdmin,
      ...missionaryScope(ctx),
      donorId: donorId === null ? null : requireRouteUuid(donorId),
    });

    return NextResponse.json({ tasks });
  },
  { roleClasses: ["missionary"] },
);

export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;
    const scope = missionaryScope(ctx);
    const input = createTaskSchema.parse(await ensureJsonBody(request));

    const task = await writeMissionaryTask(
      { supabaseAdmin, ...scope },
      "create",
      null,
      {
        ...input,
        sort_key: input.sort_key ?? Math.floor(Date.now() / 1000),
        completed_at:
          input.status === "completed" ? new Date().toISOString() : null,
      },
    );

    return NextResponse.json({ task }, { status: 201 });
  },
  { roleClasses: ["missionary"] },
);
