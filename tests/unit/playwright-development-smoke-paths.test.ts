import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import SafeReporter, {
  assertSmokeArtifactDirectories,
} from "../../tests/e2e/development-smoke/safe-reporter";

import type { FullConfig, FullResult, Suite } from "@playwright/test/reporter";
import type * as Fs from "node:fs";

const mutations = vi.hoisted(() => ({
  remove: vi.fn(),
  mkdir: vi.fn(),
  write: vi.fn(),
}));
vi.mock("node:fs", async (importOriginal) => ({
  ...(await importOriginal<typeof Fs>()),
  rmSync: mutations.remove,
  mkdirSync: mutations.mkdir,
  writeFileSync: mutations.write,
}));
const realFs = await vi.importActual<typeof Fs>("node:fs");

afterEach(() => vi.restoreAllMocks());

function fixture() {
  vi.clearAllMocks();
  const root = realFs.mkdtempSync(join(tmpdir(), "core-smoke-alias-guard-"));
  const workspace = join(root, "workspace");
  realFs.mkdirSync(workspace);
  realFs.writeFileSync(
    join(workspace, "sentinel.txt"),
    "workspace must survive",
  );
  realFs.symlinkSync(root, join(workspace, "alias"), "junction");
  const cwd = vi.spyOn(process, "cwd").mockReturnValue(workspace);
  return {
    root,
    workspace,
    close() {
      cwd.mockRestore();
      expect(realFs.readFileSync(join(workspace, "sentinel.txt"), "utf8")).toBe(
        "workspace must survive",
      );
      realFs.rmSync(root, { recursive: true, force: true });
    },
  };
}

function runReporter(report: string, output: string) {
  const reporter = new SafeReporter({ outputFolder: report });
  reporter.onBegin(
    { projects: [{ outputDir: output }] } as FullConfig,
    { allTests: () => [] } as unknown as Suite,
  );
  reporter.onEnd({ status: "failed" } as FullResult);
}

describe("smoke artifact canonical path safety", () => {
  it.each([
    "output-equals-workspace",
    "report-ancestor",
    "same-new-target",
    "nested-new-report",
    "nested-new-output",
  ] as const)(
    "rejects %s through an existing symlink before requesting removal",
    (kind) => {
      const setup = fixture();
      try {
        const { root, workspace } = setup;
        const cases = {
          "output-equals-workspace": [
            join(root, "report"),
            join(workspace, "alias", "workspace"),
          ],
          "report-ancestor": [
            join(workspace, "alias"),
            join(workspace, "output"),
          ],
          "same-new-target": [
            join(root, "new-run"),
            join(workspace, "alias", "new-run"),
          ],
          "nested-new-report": [
            join(workspace, "alias", "new-output", "report"),
            join(root, "new-output"),
          ],
          "nested-new-output": [
            join(root, "new-report"),
            join(workspace, "alias", "new-report", "output"),
          ],
        };
        const [report, output] = cases[kind];
        expect(() => runReporter(report!, output!)).toThrow(
          "Smoke report and test-output directories must be separate run directories.",
        );
        expect(mutations.remove).not.toHaveBeenCalled();
      } finally {
        setup.close();
      }
    },
  );

  it("permits separate new run directories through a resolved parent", () => {
    const setup = fixture();
    try {
      expect(
        assertSmokeArtifactDirectories(join(setup.workspace, "new-report"), [
          join(setup.workspace, "alias", "new-output"),
        ]),
      ).toEqual({
        reportDirectory: join(setup.workspace, "new-report"),
        outputDirectories: [join(setup.root, "new-output")],
      });
      expect(mutations.remove).not.toHaveBeenCalled();
    } finally {
      setup.close();
    }
  });

  it("rejects a dangling symlink instead of treating it as a new parent", () => {
    const setup = fixture();
    try {
      const dangling = join(setup.workspace, "dangling");
      realFs.symlinkSync(join(setup.root, "missing"), dangling, "junction");
      expect(() =>
        runReporter(join(setup.workspace, "report"), join(dangling, "output")),
      ).toThrow();
      expect(mutations.remove).not.toHaveBeenCalled();
    } finally {
      setup.close();
    }
  });

  it("rejects an output rebound to the workspace before final cleanup", () => {
    const setup = fixture();
    try {
      const output = join(setup.workspace, "new-output");
      const reporter = new SafeReporter({
        outputFolder: join(setup.workspace, "report"),
      });
      reporter.onBegin(
        { projects: [{ outputDir: output }] } as FullConfig,
        { allTests: () => [] } as unknown as Suite,
      );
      mutations.remove.mockClear();
      realFs.symlinkSync(setup.workspace, output, "junction");
      expect(() => reporter.onEnd({ status: "failed" } as FullResult)).toThrow(
        "Smoke report and test-output directories must be separate run directories.",
      );
      expect(mutations.remove).not.toHaveBeenCalled();
    } finally {
      setup.close();
    }
  });
});
