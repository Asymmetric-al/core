import { describe, expect, it } from "vitest";

import {
  getFieldWorkerById,
  getFieldWorkers,
} from "../../../packages/mock-data";

describe("field worker donation designations", () => {
  it("keeps public worker ids separate from donation missionary UUIDs", () => {
    const [firstWorker] = getFieldWorkers();

    expect(firstWorker?.id).toBe("miss-001");
    expect(firstWorker?.givingMissionaryId).toBe(
      "20000000-0000-0000-0000-000000000001",
    );
    expect(firstWorker?.givingMissionaryId).not.toBe(firstWorker?.id);
  });

  it("returns the same donation designation from direct worker lookup", () => {
    expect(getFieldWorkerById("miss-001")?.givingMissionaryId).toBe(
      "20000000-0000-0000-0000-000000000001",
    );
  });
});
