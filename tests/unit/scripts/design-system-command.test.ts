import { mkdtemp, mkdir, writeFile, access, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  lintInvocation,
  validateSuppressions,
  runCheckedProcess,
  runLint,
} from "../../../tooling/eslint-config/lint.mjs";

describe("workspace-aware design-system lint command", () => {
  const rootDir = process.cwd();

  it("keeps native suppression paths rooted while choosing the workspace config", () => {
    const invocation = lintInvocation({
      rootDir,
      cwd: path.join(rootDir, "apps/donor"),
      args: ["app/global-not-found.tsx", "--format", "json"],
    });
    expect(invocation.cwd).toBe(rootDir);
    expect(invocation.args).toContain(
      path.join(rootDir, "apps/donor/eslint.config.mjs"),
    );
    expect(invocation.args).toContain(
      path.join(rootDir, "apps/donor/app/global-not-found.tsx"),
    );
    expect(invocation.args).toContain(
      path.join(rootDir, "tooling/eslint-config/suppressions.json"),
    );
    expect(invocation.args).toContain("json");
    expect(invocation.workspaces).toEqual(["apps/donor"]);
  });

  it.each([
    "--suppress-all",
    "--suppress-rule=shadcn/no-restyle",
    "--cache",
    "--rule=shadcn/no-restyle:off",
  ])(
    "rejects %s so normal lint cannot enlarge debt or skip cross-file checks",
    (flag) => {
      expect(() =>
        lintInvocation({ rootDir, cwd: rootDir, args: [flag] }),
      ).toThrow();
    },
  );

  it("does not load the UI health suite for a backend-only staged check", () => {
    const invocation = lintInvocation({
      rootDir,
      cwd: rootDir,
      args: ["packages/api/src/example.ts", "--fix"],
    });
    expect(invocation.workspaces).toEqual([]);
    expect(invocation.args).toContain("--fix");
  });

  it("keeps workspace globs on the workspace's own health config", () => {
    const invocation = lintInvocation({
      rootDir,
      cwd: path.join(rootDir, "apps/donor"),
      args: ["components/**/*.tsx"],
    });
    expect(invocation.workspaces).toEqual(["apps/donor"]);
  });

  it("requires the root command when a workspace command targets another package", () => {
    expect(() =>
      lintInvocation({
        rootDir,
        cwd: path.join(rootDir, "apps/donor"),
        args: ["../../packages/ui"],
      }),
    ).toThrow("root");
  });

  it("accepts only native counts for new rules in owned UI paths", () => {
    expect(() =>
      validateSuppressions({
        "apps/donor/components/old.tsx": { "shadcn/no-restyle": { count: 2 } },
      }),
    ).not.toThrow();
    expect(() =>
      validateSuppressions({
        "apps/donor/components/old.tsx": { "no-debugger": { count: 1 } },
      }),
    ).toThrow();
    expect(() =>
      validateSuppressions({
        "packages/api/src/old.ts": { "shadcn/no-restyle": { count: 1 } },
      }),
    ).toThrow();
    expect(() =>
      validateSuppressions({
        "apps/donor/../other.tsx": { "shadcn/no-restyle": { count: 1 } },
      }),
    ).toThrow();
    expect(() =>
      validateSuppressions({
        "apps/donor/components/old.tsx": { "shadcn/no-restyle": { count: -1 } },
      }),
    ).toThrow();
  });

  it("fails closed on the plugin's operational warnings and preserves native statuses", async () => {
    const temporary = await mkdtemp(
      path.join(os.tmpdir(), "core-lint-stderr-"),
    );
    try {
      const script = path.join(temporary, "probe.mjs");
      await writeFile(
        script,
        'console.warn("[@shadcn/lint] theme unavailable");',
      );
      expect(await runCheckedProcess(script, [], temporary)).toBe(2);
      await writeFile(
        script,
        'console.warn("an unrelated tool warning contains error");',
      );
      expect(await runCheckedProcess(script, [], temporary)).toBe(0);
      await writeFile(script, "process.exitCode = 1;");
      expect(await runCheckedProcess(script, [], temporary)).toBe(1);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });

  it("finishes failed health in a separate process before a full lint process can create a report", async () => {
    const temporary = await mkdtemp(
      path.join(os.tmpdir(), "core-lint-phases-"),
    );
    try {
      await mkdir(path.join(temporary, "tooling/eslint-config"), {
        recursive: true,
      });
      await mkdir(path.join(temporary, "apps/donor"), { recursive: true });
      await writeFile(
        path.join(temporary, "tooling/eslint-config/suppressions.json"),
        "{}",
      );
      await writeFile(
        path.join(temporary, "apps/donor/eslint.config.mjs"),
        "export default [];",
      );
      const report = path.join(temporary, "report.json");
      expect(
        await runLint({
          rootDir: temporary,
          cwd: path.join(temporary, "apps/donor"),
          args: ["--format", "json", "--output-file", report],
        }),
      ).toBe(2);
      await expect(access(report)).rejects.toThrow();
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });
});
