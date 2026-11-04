import { describe, expect, it } from "vitest";

import {
  citedTraceIds,
  taskDependencyIds,
} from "../../../docs/prds/sitestacker-parity/phase-29-files-documents/tools/task-order.mjs";

describe("phase 29 task order", () => {
  it("expands task ranges instead of keeping only the endpoints", () => {
    expect(taskDependencyIds("3.1 through 3.7, 7.3, 7.4, 8.1")).toEqual([
      "3.1",
      "3.2",
      "3.3",
      "3.4",
      "3.5",
      "3.6",
      "3.7",
      "7.3",
      "7.4",
      "8.1",
    ]);
    expect(
      taskDependencyIds(
        "Applicable 4.1–4.13 source paths, applicable 3.1–3.7 policy/event paths, 5.8 and 5.9 only for their offered qualified effects, 6.5 only when a reference is deliberately offered, and 8.1–8.3.",
      ),
    ).toEqual([
      "4.1",
      "4.2",
      "4.3",
      "4.4",
      "4.5",
      "4.6",
      "4.7",
      "4.8",
      "4.9",
      "4.10",
      "4.11",
      "4.12",
      "4.13",
      "3.1",
      "3.2",
      "3.3",
      "3.4",
      "3.5",
      "3.6",
      "3.7",
      "5.8",
      "5.9",
      "6.5",
      "8.1",
      "8.2",
      "8.3",
    ]);
  });

  it("does not turn separate task ids into a range", () => {
    expect(taskDependencyIds("1.1,1.2")).toEqual(["1.1", "1.2"]);
    expect(taskDependencyIds("5.8 and 5.9")).toEqual(["5.8", "5.9"]);
  });

  it("expands acceptance ranges and leaves listed ids alone", () => {
    expect(
      citedTraceIds("AC29-P01-01 through AC29-P01-05; AC29-D24-01, AC29-D24-09"),
    ).toEqual([
      "AC29-P01-01",
      "AC29-P01-02",
      "AC29-P01-03",
      "AC29-P01-04",
      "AC29-P01-05",
      "AC29-D24-01",
      "AC29-D24-09",
    ]);
  });
});
