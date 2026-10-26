import { describe, expect, expectTypeOf, it } from "vitest";

import { TA, TB, U1, asAssignment, row } from "./fixtures";
import { toHumanProjectionAssignment } from "../../../../../packages/api/src/principal/projection";
import {
  AssignmentReaderError,
  createRpcAssignmentReader,
} from "../../../../../packages/api/src/principal/reader";

import type { HumanProjectionContext } from "../../../../../packages/api/src/projection/types";

function client(result: { data: unknown; error: unknown }) {
  const calls: unknown[][] = [];
  return {
    calls,
    rpc: async (...args: unknown[]) => {
      calls.push(args);
      return result;
    },
  };
}

describe("createRpcAssignmentReader", () => {
  it("calls current_user_assignments with no arguments and returns the rows untouched", async () => {
    const rows = [row(TA, "donor"), row(TB, "staff", "hr")];
    const c = client({ data: rows, error: null });
    const out = await createRpcAssignmentReader(c).listActiveAssignments();
    expect(c.calls).toEqual([["current_user_assignments"]]);
    expect(out).toBe(rows);
  });

  it("reads again on every call", async () => {
    const c = client({ data: [], error: null });
    const reader = createRpcAssignmentReader(c);
    await reader.listActiveAssignments();
    await reader.listActiveAssignments();
    expect(c.calls).toHaveLength(2);
  });

  it.each([
    ["an error", { data: [row(TA, "donor")], error: { code: "42501" } }],
    ["null data", { data: null, error: null }],
    ["object data", { data: { id: "x" }, error: null }],
  ])("throws AssignmentReaderError on %s", async (_name, result) => {
    await expect(
      createRpcAssignmentReader(client(result)).listActiveAssignments(),
    ).rejects.toBeInstanceOf(AssignmentReaderError);
  });
});

describe("toHumanProjectionAssignment (criterion 2)", () => {
  it("maps exactly onto HumanProjectionContext['assignment'] with revision = currentRevision", () => {
    const a = asAssignment(row(TA, "staff", "finance", U1));
    const mapped = toHumanProjectionAssignment(a);
    expectTypeOf(mapped).toEqualTypeOf<HumanProjectionContext["assignment"]>();
    expect(mapped).toEqual({
      id: a.assignmentId,
      revision: a.revision,
      currentRevision: a.revision,
      principalId: U1,
      tenantId: TA,
    });
  });
});
