import { describe, expect, it, vi } from "vitest";

import {
  createReactDoctorCommand,
  createSpawnCommand,
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

  it("builds the expected React Doctor command with current CLI flags", () => {
    const command = createReactDoctorCommand("apps/admin", [
      "--full",
      "--offline",
      "--fail-on",
      "none",
    ]);

    expect(command.command).toBe("bunx");
    expect(command.args).toEqual([
      "--bun",
      "react-doctor@latest",
      "apps/admin",
      "--verbose",
      "--scope",
      "full",
      "--no-score",
      "--blocking",
      "none",
    ]);
  });

  it("normalizes equals-style fail-on flags", () => {
    expect(
      createReactDoctorCommand("packages/ui", ["--fail-on=none"]).args,
    ).toEqual([
      "--bun",
      "react-doctor@latest",
      "packages/ui",
      "--verbose",
      "--blocking=none",
    ]);
  });

  it("keeps current React Doctor flags unchanged", () => {
    expect(
      createReactDoctorCommand("packages/ui", [
        "--scope",
        "full",
        "--blocking",
        "none",
      ]).args,
    ).toEqual([
      "--bun",
      "react-doctor@latest",
      "packages/ui",
      "--verbose",
      "--scope",
      "full",
      "--blocking",
      "none",
    ]);
  });

  it("wraps bunx through cmd.exe on Windows", () => {
    expect(
      createSpawnCommand(
        { command: "bunx", args: ["--bun", "react-doctor@latest"] },
        { platform: "win32", comSpec: "C:\\Windows\\System32\\cmd.exe" },
      ),
    ).toEqual({
      command: "C:\\Windows\\System32\\cmd.exe",
      args: ["/d", "/s", "/c", "bunx", "--bun", "react-doctor@latest"],
    });
  });

  it("spawns the command directly outside Windows", () => {
    const command = {
      command: "bunx",
      args: ["--bun", "react-doctor@latest"],
    };

    expect(createSpawnCommand(command, { platform: "linux" })).toBe(command);
  });

  it("stops at the first failing target", () => {
    const spawn = vi
      .fn()
      .mockReturnValueOnce({ status: 0 })
      .mockReturnValueOnce({ status: 7 });

    expect(
      runReactDoctorTargets({
        targets: ["apps/admin", "apps/donor", "apps/missionary"],
        extraArgs: ["--scope", "full"],
        cwd: "/repo",
        spawn,
      }),
    ).toBe(7);

    expect(spawn).toHaveBeenCalledTimes(2);
  });
});
