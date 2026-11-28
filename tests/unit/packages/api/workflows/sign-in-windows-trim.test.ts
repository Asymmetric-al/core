import { InngestTestEngine } from "@inngest/test";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  trim: vi.fn(),
  scan: vi.fn(),
}));

vi.mock("../../../../../packages/api/src/workflows/admin-client", () => ({
  requireWorkflowAdminClient: () => ({}),
}));
vi.mock("../../../../../packages/api/src/workflows/recovery", () => ({
  runDispatchRecoveryScan: state.scan,
}));
vi.mock("../../../../../packages/api/src/identity/sign-in-limits", () => ({
  trimSignInWindows: state.trim,
}));

import { dispatchRecoveryScan } from "../../../../../packages/api/src/workflows/functions/dispatch-recovery-scan";

beforeEach(() => {
  state.trim.mockReset().mockResolvedValue(4);
  state.scan.mockReset().mockResolvedValue({ retried: 0 });
});

describe("the sign-in limits' ended windows go on a schedule that already runs (AL-2671 N4, Y8)", () => {
  it("trims them within one tick of the half-hourly dispatch recovery scan, in the same step", async () => {
    const { result } = await new InngestTestEngine({
      function: dispatchRecoveryScan,
    }).execute();
    expect(state.trim).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ retried: 0 });
  });

  it("a trim that fails does not fail the scan, and is logged with a countable code", async () => {
    state.trim.mockRejectedValueOnce(new Error("unavailable"));
    const errors = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { result } = await new InngestTestEngine({
      function: dispatchRecoveryScan,
    }).execute();
    expect(result).toEqual({ retried: 0 });
    expect(JSON.stringify(errors.mock.calls)).toContain(
      "sign_in_windows_trim_failed",
    );
    errors.mockRestore();
  });
});
