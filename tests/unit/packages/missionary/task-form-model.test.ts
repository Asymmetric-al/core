import { describe, expect, it } from "vitest";

import {
  createInitialTaskFormValues,
  toMissionaryTaskPayload,
} from "../../../../packages/missionary/components/task-form-model";

import type { Task } from "../../../../packages/missionary/types";

describe("packages/missionary/components/task-form-model", () => {
  it("creates defaults for a new task form", () => {
    expect(
      createInitialTaskFormValues({
        defaultDonorId: "donor-1",
        initialStatus: "waiting",
      }),
    ).toEqual({
      title: "",
      description: "",
      notes: "",
      task_type: "to_do",
      status: "waiting",
      priority: "none",
      due_date: null,
      reminder_date: null,
      donor_id: "donor-1",
    });
  });

  it("hydrates defaults from an existing task", () => {
    const task: Task = {
      id: "task-1",
      missionary_id: "missionary-1",
      donor_id: "donor-1",
      donor: {
        id: "donor-1",
        name: "Alice Johnson",
        email: "alice@example.com",
        avatar_url: null,
      },
      title: "Follow up",
      description: "Call donor",
      notes: "Bring latest update",
      task_type: "call",
      status: "in_progress",
      priority: "high",
      due_date: "2026-04-01T10:00:00.000Z",
      reminder_date: "2026-04-01T09:00:00.000Z",
      completed_at: null,
      sort_key: 1,
      is_auto_generated: false,
      auto_generation_source: null,
      created_at: "2026-03-30T00:00:00.000Z",
      updated_at: "2026-03-30T00:00:00.000Z",
    };

    const values = createInitialTaskFormValues({ task });

    expect(values.title).toBe("Follow up");
    expect(values.task_type).toBe("call");
    expect(values.status).toBe("in_progress");
    expect(values.priority).toBe("high");
    expect(values.donor_id).toBe("donor-1");
    expect(values.due_date?.toISOString()).toBe("2026-04-01T10:00:00.000Z");
    expect(values.reminder_date?.toISOString()).toBe(
      "2026-04-01T09:00:00.000Z",
    );
  });

  it("builds a task upsert payload with nullable optional fields", () => {
    const payload = toMissionaryTaskPayload({
      missionaryId: "missionary-1",
      values: {
        title: "Follow up",
        description: "",
        notes: "",
        task_type: "email",
        status: "not_started",
        priority: "medium",
        due_date: new Date("2026-04-01T10:00:00.000Z"),
        reminder_date: null,
        donor_id: "",
      },
    });

    expect(payload).toMatchObject({
      missionary_id: "missionary-1",
      title: "Follow up",
      description: null,
      notes: null,
      task_type: "email",
      status: "not_started",
      priority: "medium",
      due_date: "2026-04-01T10:00:00.000Z",
      reminder_date: null,
      donor_id: null,
      is_auto_generated: false,
    });
    expect(typeof payload.updated_at).toBe("string");
  });
});
