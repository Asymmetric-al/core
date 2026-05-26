import { describe, expect, it, vi } from "vitest";

import {
  createReactDoctorCommand,
  REACT_DOCTOR_TARGETS,
  runReactDoctorTargets,
} from "../../../scripts/react-doctor-first-party.mjs";

describe("react-doctor first-party wrapper", () => {
  it("targets concrete React project roots instead of aggregate workspace folders", () => {
    expect(REACT_DOCTOR_TARGETS).toContain("apps/admin");
    expect(REACT_DOCTOR_TARGETS).toContain("apps/donor");
    expect(REACT_DOCTOR_TARGETS).toContain("apps/missionary");
    expect(REACT_DOCTOR_TARGETS).toContain("packages/ui");
    expect(REACT_DOCTOR_TARGETS).not.toContain("apps");
    expect(REACT_DOCTOR_TARGETS).not.toContain("packages");
  });

  it("builds the expected React Doctor command", () => {
    expect(
      createReactDoctorCommand("apps/admin", [
        "--full",
        "--offline",
        "--fail-on",
        "none",
      ]).args,
    ).toEqual([
      "x",
      "--bun",
      "react-doctor@latest",
      "apps/admin",
      "--verbose",
      "--full",
      "--offline",
      "--fail-on",
      "none",
    ]);
  });

  it("stops at the first failing target", () => {
    const spawn = vi
      .fn()
      .mockReturnValueOnce({ status: 0 })
      .mockReturnValueOnce({ status: 7 });

    expect(
      runReactDoctorTargets({
        targets: ["apps/admin", "apps/donor", "apps/missionary"],
        extraArgs: ["--full"],
        cwd: "/repo",
        spawn,
      }),
    ).toBe(7);

    expect(spawn).toHaveBeenCalledTimes(2);
  });
});
