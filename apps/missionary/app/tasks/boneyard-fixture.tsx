"use client";

import { TaskRow } from "@asym/missionary/components/task-row";

import type { Task } from "@asym/missionary/types";

/** Static tasks for Boneyard CLI capture only (`window.__BONEYARD_BUILD`). */
const FIXTURE_TIMESTAMP = "2099-04-08T12:00:00.000Z";
const FIXTURE_FOLLOW_UP_DUE_DATE = "2099-04-15";

export const MISSIONARY_TASKS_BONEYARD_FIXTURE: Task[] = [
  {
    id: "by-fixture-1",
    missionary_id: "m1",
    title: "Follow up with Jordan Lee about monthly pledge",
    description:
      "Confirm updated card on file and thank them for increased giving.",
    notes: null,
    task_type: "call",
    status: "in_progress",
    priority: "high",
    due_date: FIXTURE_FOLLOW_UP_DUE_DATE,
    reminder_date: null,
    donor_id: "d1",
    donor: {
      id: "d1",
      name: "Jordan Lee",
      email: "jordan@example.com",
      avatar_url: null,
    },
    sort_key: 1,
    is_auto_generated: false,
    created_at: FIXTURE_TIMESTAMP,
    updated_at: FIXTURE_TIMESTAMP,
    completed_at: null,
  },
  {
    id: "by-fixture-2",
    missionary_id: "m1",
    title: "Send quarterly ministry update email",
    description: "Include photos from the field trip and prayer requests.",
    notes: null,
    task_type: "email",
    status: "not_started",
    priority: "medium",
    due_date: null,
    reminder_date: null,
    donor_id: null,
    donor: null,
    sort_key: 2,
    is_auto_generated: true,
    created_at: FIXTURE_TIMESTAMP,
    updated_at: FIXTURE_TIMESTAMP,
    completed_at: null,
  },
  {
    id: "by-fixture-3",
    missionary_id: "m1",
    title: "Thank you note for year-end gift",
    description: "Handwritten note to the Smith family.",
    notes: null,
    task_type: "thank_you",
    status: "not_started",
    priority: "low",
    due_date: null,
    reminder_date: null,
    donor_id: "d2",
    donor: {
      id: "d2",
      name: "Alex & Sam Smith",
      email: "smith@example.com",
      avatar_url: null,
    },
    sort_key: 3,
    is_auto_generated: false,
    created_at: FIXTURE_TIMESTAMP,
    updated_at: FIXTURE_TIMESTAMP,
    completed_at: null,
  },
  {
    id: "by-fixture-4",
    missionary_id: "m1",
    title: "Schedule partner meeting",
    description: "Coffee with regional director next week.",
    notes: null,
    task_type: "meeting",
    status: "waiting",
    priority: "none",
    due_date: null,
    reminder_date: null,
    donor_id: null,
    donor: null,
    sort_key: 4,
    is_auto_generated: false,
    created_at: FIXTURE_TIMESTAMP,
    updated_at: FIXTURE_TIMESTAMP,
    completed_at: null,
  },
  {
    id: "by-fixture-5",
    missionary_id: "m1",
    title: "Review donor segment for spring appeal",
    description: null,
    notes: null,
    task_type: "to_do",
    status: "not_started",
    priority: "medium",
    due_date: null,
    reminder_date: null,
    donor_id: null,
    donor: null,
    sort_key: 5,
    is_auto_generated: false,
    created_at: FIXTURE_TIMESTAMP,
    updated_at: FIXTURE_TIMESTAMP,
    completed_at: null,
  },
];

export function MissionaryTasksListBoneyardFixture() {
  return (
    <div className="space-y-3">
      {MISSIONARY_TASKS_BONEYARD_FIXTURE.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          onComplete={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          index={index}
        />
      ))}
    </div>
  );
}
