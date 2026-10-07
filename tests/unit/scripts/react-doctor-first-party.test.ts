import { describe, expect, it, vi } from "vitest";

import {
  createReactDoctorCommand,
  createSpawnCommand,
  REACT_DOCTOR_TARGETS,
  runReactDoctorTargets,
} from "../../../scripts/react-doctor-first-party.mjs";

describe("react-doctor first-party wrapper", () => {
  it("pins the audit and disables remote services even when callers omit offline flags", () => {
    const command = createReactDoctorCommand("apps/admin");
    expect(command.args[0]).toBe("react-doctor@0.9.17");
    expect(command.args).toEqual(
      expect.arrayContaining([
        "--no-score",
        "--no-supply-chain",
        "--no-telemetry",
      ]),
    );
  });

  it.each(["--score", "--supply-chain", "--share"])(
    "rejects remote-mode override %s",
    (flag) => {
      expect(() => createReactDoctorCommand("apps/admin", [flag])).toThrow(
        /offline/i,
      );
    },
  );

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
      "react-doctor@0.9.17",
      "apps/admin",
      "--verbose",
      "--scope",
      "full",
      "--no-score",
      "--blocking",
      "none",
      "--no-supply-chain",
      "--no-telemetry",
    ]);
  });

  it("runs React Doctor on Node instead of forcing the Bun runtime", () => {
    // react-doctor spawns its rule engine over Node IPC and calls
    // `child.channel.unref()`, which Bun's ChildProcess does not implement.
    // Forcing `bunx --bun` makes every target fail before any rule runs.
    expect(createReactDoctorCommand("apps/admin").args).not.toContain("--bun");
  });

  it("normalizes equals-style fail-on flags", () => {
    expect(
      createReactDoctorCommand("packages/ui", ["--fail-on=none"]).args,
    ).toEqual([
      "react-doctor@0.9.17",
      "packages/ui",
      "--verbose",
      "--blocking=none",
      "--no-score",
      "--no-supply-chain",
      "--no-telemetry",
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
      "react-doctor@0.9.17",
      "packages/ui",
      "--verbose",
      "--scope",
      "full",
      "--blocking",
      "none",
      "--no-score",
      "--no-supply-chain",
      "--no-telemetry",
    ]);
  });

  it("wraps bunx through cmd.exe on Windows", () => {
    expect(
      createSpawnCommand(
        { command: "bunx", args: ["react-doctor@0.9.17"] },
        { platform: "win32", comSpec: "C:\\Windows\\System32\\cmd.exe" },
      ),
    ).toEqual({
      command: "C:\\Windows\\System32\\cmd.exe",
      args: ["/d", "/s", "/c", "bunx", "react-doctor@0.9.17"],
    });
  });

  it("spawns the command directly outside Windows", () => {
    const command = {
      command: "bunx",
      args: ["react-doctor@0.9.17"],
    };

    expect(createSpawnCommand(command, { platform: "linux" })).toBe(command);
  });

  it("refuses scanner source rewrites in the live-checkout wrapper", () => {
    const spawn = vi.fn();
    expect(() =>
      runReactDoctorTargets({
        targets: ["apps/admin"],
        extraArgs: ["--no-respect-inline-disables"],
        spawn,
      }),
    ).toThrow(/snapshot/i);
    expect(spawn).not.toHaveBeenCalled();
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
