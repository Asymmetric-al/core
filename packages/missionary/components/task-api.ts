"use client";

import { ownApiFetch } from "@asym/database/own-api";

import type { TaskPartner } from "./task-partner-select";
import type { Task, TaskPriority, TaskStatus, TaskType } from "../types";

/**
 * The task dialog's server commands (plan 5.2, "The browser data layer is
 * scoped…": the modules that called the browser client's tables directly
 * move onto the scoped layer or behind server commands; WP2b, AL-2675).
 *
 * Tasks are created and changed through the missionary workspace's task
 * routes, which take the missionary and the tenant from the request's
 * resolved assignment and check the partner against them; the collection
 * registry marks `missionary_tasks` as server-command owned. The partner
 * list is the workspace's redacted partner list, so a partner who gives
 * anonymously is never named here. Both go through the own-API wrapper, which
 * sends the document's tenant and assignment.
 */

/** The task fields the task routes store. */
export interface MissionaryTaskWrite {
  title: string;
  description: string | null;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  donor_id: string | null;
}

async function readError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof payload?.error === "string" && payload.error
    ? payload.error
    : fallback;
}

/** Creates a task, or changes `taskId`'s, and returns it as the route stored it. */
export async function saveMissionaryTask(
  taskId: string | null,
  task: MissionaryTaskWrite,
): Promise<Task> {
  const response = await ownApiFetch(
    taskId
      ? `/api/missionary/tasks/${encodeURIComponent(taskId)}`
      : "/api/missionary/tasks",
    {
      method: taskId ? "PATCH" : "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    },
  );
  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        taskId ? "Failed to update task" : "Failed to create task",
      ),
    );
  }
  const payload = (await response.json()) as { task?: Task };
  if (!payload.task) throw new Error("The task route returned no task");
  return payload.task;
}

const PARTNER_PAGE_SIZE = 100;

/** Every partner of the signed-in missionary, page by page, redacted. */
export async function listMissionaryTaskPartners(
  signal?: AbortSignal,
): Promise<TaskPartner[]> {
  const partners: TaskPartner[] = [];
  for (let offset = 0; ;) {
    const response = await ownApiFetch(
      `/api/missionary/donors?limit=${PARTNER_PAGE_SIZE}&offset=${offset}`,
      { headers: { Accept: "application/json" }, signal },
    );
    if (!response.ok) {
      throw new Error(await readError(response, "Failed to load partners"));
    }
    const page = (await response.json()) as {
      donors?: Array<{
        id: string;
        name: string;
        email?: string;
        avatar_url?: string | null;
      }>;
      hasMore?: boolean;
      nextOffset?: number | null;
    };
    for (const donor of page.donors ?? []) {
      partners.push({
        id: donor.id,
        name: donor.name,
        email: donor.email,
        avatar_url: donor.avatar_url ?? null,
      });
    }
    if (!page.hasMore || typeof page.nextOffset !== "number") return partners;
    offset = page.nextOffset;
  }
}
