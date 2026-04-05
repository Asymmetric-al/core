import { describe, expect, it } from "vitest";

import {
  createDefaultReminder,
  createInitialTaskFormValues,
  normalizeReminders,
  toTaskSavePayload,
} from "../../../../../../apps/admin/app/tasks/task-form-model";

import type {
  LinkedEntity,
  StaffMember,
  Task,
  TaskReminder,
} from "../../../../../../apps/admin/app/tasks/types";

const LINKED_ENTITY: LinkedEntity = {
  id: "donor-1",
  type: "donor",
  name: "Alice Johnson",
  email: "alice@example.com",
};

const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "staff-1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar_url: "https://example.com/avatar.png",
    role: "Development Director",
  },
];

describe("apps/admin/app/tasks/task-form-model", () => {
  it("normalizes reminders and preserves existing ids", () => {
    const reminders = normalizeReminders([
      {
        remind_at: "2026-03-31T09:00:00.000Z",
        type: "notification",
      },
      {
        id: "existing-reminder",
        remind_at: "2026-03-31T10:00:00.000Z",
        type: "email",
      },
    ]);

    expect(reminders[0]?.id).toMatch(
      /^rem-notification-2026-03-31T09:00:00.000Z-0$/,
    );
    expect(reminders[1]?.id).toBe("existing-reminder");
  });

  it("creates initial form values from an existing task", () => {
    const task: Task = {
      id: "task-1",
      tenant_id: "tenant-1",
      title: "Follow up",
      description: "Call donor",
      type: "call",
      priority: "high",
      status: "todo",
      due_date: "2026-04-01",
      due_time: "14:30",
      created_by: "staff-1",
      assigned_to: "staff-1",
      assigned_to_name: "Sarah Johnson",
      assigned_to_avatar: "https://example.com/avatar.png",
      linked_entity: LINKED_ENTITY,
      reminders: [
        {
          id: "rem-1",
          task_id: "task-1",
          remind_at: "2026-04-01T13:30:00.000Z",
          type: "notification",
          sent: false,
        },
      ],
      comments: [],
      tags: ["major-donor"],
      created_at: "2026-03-30T00:00:00.000Z",
      updated_at: "2026-03-30T00:00:00.000Z",
    };

    const values = createInitialTaskFormValues(task);

    expect(values.title).toBe("Follow up");
    expect(values.dueDate?.toISOString()).toContain("2026-04-01");
    expect(values.linkedEntity).toEqual(LINKED_ENTITY);
    expect(values.reminders[0]?.id).toBe("rem-1");
  });

  it("creates a default reminder one hour before the due date", () => {
    const reminder = createDefaultReminder(
      new Date("2026-04-01T18:00:00.000Z"),
    );

    expect(reminder.remind_at).toBe("2026-04-01T17:00:00.000Z");
    expect(reminder.type).toBe("notification");
    expect(reminder.sent).toBe(false);
  });

  it("builds a save payload with formatted dates and assignee metadata", () => {
    const payload = toTaskSavePayload({
      taskId: "task-1",
      staffMembers: STAFF_MEMBERS,
      values: {
        title: "Follow up",
        description: "",
        type: "call",
        priority: "urgent",
        status: "todo",
        dueDate: new Date("2026-04-01T00:00:00.000Z"),
        dueTime: "09:15",
        assignedTo: "staff-1",
        linkedEntity: LINKED_ENTITY,
        reminders: [
          {
            id: "rem-1",
            remind_at: "2026-04-01T08:15:00.000Z",
            type: "notification",
            sent: false,
          },
        ] satisfies TaskReminder[],
        tags: ["major-donor"],
      },
    });

    expect(payload).toMatchObject({
      id: "task-1",
      title: "Follow up",
      priority: "urgent",
      due_date: "2026-04-01",
      due_time: "09:15",
      assigned_to: "staff-1",
      assigned_to_name: "Sarah Johnson",
      assigned_to_avatar: "https://example.com/avatar.png",
      linked_entity: LINKED_ENTITY,
      tags: ["major-donor"],
    });
    expect(payload.description).toBeUndefined();
  });
});
