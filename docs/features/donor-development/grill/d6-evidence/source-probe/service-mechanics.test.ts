import { describe, expect, it } from "vitest";

import { createMissionControlTask } from "../../../../../../packages/api/src/admin/mission-control-tasks/service";

// Counterexample probe: calls current Core source with synthetic dependencies.
// No database/provider call; does not qualify D6 or production persistence.
describe("D6 reuse counterexamples in current task service", () => {
  it("a failed link write rejects after the task dependency accepted its write", async () => {
    const acceptedTasks: string[] = [];
    const events: string[] = [];
    await expect(
      createMissionControlTask({
        tenantId: "synthetic-tenant",
        source: "contribution_operations",
        issueType: "correction_review",
        title: "Synthetic probe",
        description: "Synthetic probe",
        actorProfileId: "synthetic-actor",
        queueId: "synthetic-queue",
        linkedRecords: [],
        urgency: "normal",
        dependencies: {
          insertTask: async () => {
            acceptedTasks.push("task-1");
            return "task-1";
          },
          insertLinks: async () => {
            throw new Error("synthetic link failure");
          },
          appendEvent: async () => {
            events.push("created");
          },
        },
      }),
    ).rejects.toThrow("synthetic link failure");
    expect(acceptedTasks).toEqual(["task-1"]);
    expect(events).toEqual([]);
  });

  it("an unqualified retry after that failure can accept a second task write", async () => {
    const acceptedTasks: string[] = [];
    let rejectLinks = true;
    const submit = () =>
      createMissionControlTask({
        tenantId: "synthetic-tenant",
        source: "contribution_operations",
        issueType: "correction_review",
        title: "Synthetic probe",
        description: "Synthetic probe",
        actorProfileId: "synthetic-actor",
        queueId: "synthetic-queue",
        linkedRecords: [],
        urgency: "normal",
        dependencies: {
          insertTask: async () => {
            const id = `task-${acceptedTasks.length + 1}`;
            acceptedTasks.push(id);
            return id;
          },
          insertLinks: async () => {
            if (rejectLinks) throw new Error("synthetic link failure");
          },
          appendEvent: async () => {},
        },
      });
    await expect(submit()).rejects.toThrow("synthetic link failure");
    rejectLinks = false;
    await expect(submit()).resolves.toMatchObject({ taskId: "task-2" });
    expect(acceptedTasks).toEqual(["task-1", "task-2"]);
  });
});
