import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { repositoryGitEnvironment } from "../../../scripts/git/environment.mjs";
import {
  assertCompleteReactDoctorScans,
  createReactDoctorReport,
  parseReactDoctorAuditArgs,
  resolveChangedSince,
  runReactDoctorAudit,
  runReactDoctorAuditCommand,
} from "../../../scripts/react-doctor-audit.mjs";
import {
  REACT_DOCTOR_TARGETS,
  REACT_DOCTOR_VERSION,
} from "../../../scripts/react-doctor-first-party.mjs";

type Diagnostic = Record<string, unknown> & { filePath: string };
type Scan = {
  target: string;
  complete: boolean;
  diagnostics: Diagnostic[];
  skippedChecks: string[];
  scannedFileCount: number;
};

const configHash = "c".repeat(64);
const roots: string[] = [];
const gitEnvironment = repositoryGitEnvironment({
  ...process.env,
  GIT_AUTHOR_NAME: "React Doctor fixture",
  GIT_AUTHOR_EMAIL: "react-doctor-fixture@example.invalid",
  GIT_COMMITTER_NAME: "React Doctor fixture",
  GIT_COMMITTER_EMAIL: "react-doctor-fixture@example.invalid",
});

function tempRoot(prefix: string) {
  const root = mkdtempSync(path.join(tmpdir(), prefix));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    const snapshotRecord = path.join(root, "audit", "snapshot.json");
    if (existsSync(snapshotRecord)) {
      const { snapshot } = JSON.parse(readFileSync(snapshotRecord, "utf8"));
      rmSync(path.dirname(snapshot), { recursive: true, force: true });
    }
    rmSync(root, { recursive: true, force: true });
  }
});

function diagnostic(
  filePath: string,
  rule = "no-tiny-text",
  extra: Record<string, unknown> = {},
): Diagnostic {
  return {
    filePath,
    plugin: "react-doctor",
    rule,
    severity: "warning",
    fingerprint: `${filePath}#${rule}`,
    line: 4,
    column: 2,
    message: `Finding for ${rule}`,
    ...extra,
  };
}

function scan(
  target: string,
  diagnostics: Diagnostic[] = [],
  overrides: Partial<Scan> = {},
): Scan {
  return {
    target,
    complete: true,
    diagnostics,
    skippedChecks: [],
    scannedFileCount: 3,
    ...overrides,
  };
}

function completeScans(findings: Record<string, Diagnostic[]> = {}) {
  return REACT_DOCTOR_TARGETS.map((target) => scan(target, findings[target]));
}

function git(root: string, args: string[]) {
  const result = spawnSync(
    "git",
    [
      "-c",
      "core.autocrlf=false",
      "-c",
      "commit.gpgsign=false",
      "-c",
      `core.hooksPath=${path.join(root, ".git", "no-hooks")}`,
      ...args,
    ],
    { cwd: root, env: gitEnvironment, encoding: "utf8" },
  );
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

function write(root: string, relative: string, contents: string) {
  mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  writeFileSync(path.join(root, relative), contents);
}

function commitAll(root: string, message: string) {
  git(root, ["add", "--all"]);
  git(root, ["commit", "--quiet", "-m", message]);
}

// develop: base commit, then a later commit the feature branch never receives.
// feature: committed edit and rename, then staged, unstaged, untracked and
// ignored working-tree files.
function divergedRepository(root = tempRoot("core-doctor-changed-")) {
  git(root, ["init", "--quiet", "--initial-branch=develop"]);
  write(root, ".gitignore", "ignored.tsx\n");
  write(root, "package.json", '{"workspaces":["apps/*","packages/*"]}\n');
  write(
    root,
    "doctor.config.json",
    '{"rules":{"react-doctor/react-in-jsx-scope":"off"}}\n',
  );
  write(root, "apps/admin/package.json", '{"dependencies":{}}\n');
  write(root, "apps/admin/stable.tsx", "export const Stable = 1;\n");
  write(root, "apps/admin/edited.tsx", "export const Edited = 1;\n");
  write(root, "apps/admin/old-name.tsx", "export const Renamed = 1;\n");
  write(root, "apps/admin/base-only.tsx", "export const BaseOnly = 1;\n");
  write(root, "packages/ui/button.tsx", "export const Button = 1;\n");
  commitAll(root, "base");
  git(root, ["switch", "--quiet", "-c", "feature"]);
  write(root, "apps/admin/edited.tsx", "export const Edited = 2;\n");
  git(root, ["mv", "apps/admin/old-name.tsx", "apps/admin/new-name.tsx"]);
  commitAll(root, "feature work");
  git(root, ["switch", "--quiet", "develop"]);
  write(root, "apps/admin/base-only.tsx", "export const BaseOnly = 2;\n");
  commitAll(root, "base moves on");
  git(root, ["switch", "--quiet", "feature"]);
  write(root, "apps/admin/staged.tsx", "export const Staged = 1;\n");
  git(root, ["add", "apps/admin/staged.tsx"]);
  write(root, "apps/admin/package.json", '{"dependencies":{"x":"1"}}\n');
  write(root, "apps/admin/untracked.tsx", "export const Untracked = 1;\n");
  write(root, "apps/admin/ignored.tsx", "export const Ignored = 1;\n");
  return root;
}

// Building the repository costs many Git calls, so tests that only read it
// share one copy. Tests that edit the source build their own.
let readOnlyRepository: string | undefined;
function sharedRepository() {
  readOnlyRepository ??= divergedRepository(
    mkdtempSync(path.join(tmpdir(), "core-doctor-shared-")),
  );
  return readOnlyRepository;
}
afterAll(() => {
  if (readOnlyRepository)
    rmSync(readOnlyRepository, { recursive: true, force: true });
});

const changedFiles = [
  "apps/admin/edited.tsx",
  "apps/admin/new-name.tsx",
  "apps/admin/package.json",
  "apps/admin/staged.tsx",
  "apps/admin/untracked.tsx",
];

function findingsInEveryFixtureFile() {
  return {
    "apps/admin": [
      diagnostic("stable.tsx"),
      diagnostic("edited.tsx"),
      diagnostic("new-name.tsx", "no-array-index-as-key"),
      diagnostic("package.json", "unused-dependency", {
        plugin: "knip",
        line: 0,
        column: 0,
        message: "Unused dependency: `x`",
      }),
      diagnostic("base-only.tsx"),
      diagnostic("staged.tsx"),
      diagnostic("untracked.tsx"),
      diagnostic("ignored.tsx"),
    ],
    "packages/ui": [diagnostic("button.tsx")],
  };
}

function fakeScanner(
  findings: Record<string, Diagnostic[]>,
  projectOverrides: Record<string, Record<string, unknown>> = {},
  onScan: (target: string) => void = () => {},
) {
  return ({ target, directory }: { target: string; directory: string }) => {
    onScan(target);
    const diagnostics = findings[target] ?? [];
    const report = {
      schemaVersion: 3,
      version: REACT_DOCTOR_VERSION,
      mode: "full",
      ok: true,
      error: null,
      directory,
      diagnostics,
      summary: {
        errorCount: diagnostics.filter((item) => item.severity === "error")
          .length,
        warningCount: diagnostics.filter((item) => item.severity === "warning")
          .length,
        totalDiagnosticCount: diagnostics.length,
        score: null,
      },
      projects: [
        {
          directory,
          packageRoot: directory,
          project: { rootDirectory: directory },
          diagnostics,
          score: null,
          complete: true,
          skippedChecks: [],
          analyzedFiles: ["component.tsx"],
          analyzedFileCount: 1,
          scannedFileCount: 1,
          ...projectOverrides[target],
        },
      ],
    };
    return { status: 0, stdout: JSON.stringify(report), stderr: "" };
  };
}

function runCommand(
  args: string[],
  root: string,
  scanTarget: ReturnType<typeof fakeScanner>,
) {
  const logs: string[] = [];
  const errors: string[] = [];
  const exitCode = runReactDoctorAuditCommand(args, {
    root,
    log: (message: string) => logs.push(message),
    logError: (message: string) => errors.push(message),
    runAudit: (options: Record<string, unknown>) =>
      runReactDoctorAudit({ ...options, scanTarget }),
  });
  return { exitCode, logs, errors };
}

describe("React Doctor advisory exit rules", () => {
  it("exits 0 for complete scans even when they report findings", () => {
    const report = createReactDoctorReport({
      scans: completeScans({
        "apps/admin": [diagnostic("app/page.tsx")],
        "packages/ui": [diagnostic("button.tsx", "no-array-index-as-key")],
      }),
      configHash,
    });
    expect(report.exitCode).toBe(0);
    expect(report.findings.findings).toHaveLength(2);
  });

  it("fails closed when any required project or check is absent", () => {
    expect(() => assertCompleteReactDoctorScans([], ["apps/admin"])).toThrow(
      /target/i,
    );
    expect(() =>
      assertCompleteReactDoctorScans(
        [scan("apps/admin", [], { skippedChecks: ["dead-code"] })],
        ["apps/admin"],
      ),
    ).toThrow(/skipped/i);
    expect(() =>
      assertCompleteReactDoctorScans(
        [scan("apps/admin", [], { complete: false })],
        ["apps/admin"],
      ),
    ).toThrow(/incomplete/i);
  });

  it("refuses to report when a target is missing or repeated", () => {
    const scans = completeScans();
    expect(() =>
      createReactDoctorReport({ scans: scans.slice(1), configHash }),
    ).toThrow(/every required target exactly once/i);
    expect(() =>
      createReactDoctorReport({ scans: [...scans, scans[0]], configHash }),
    ).toThrow(/every required target exactly once/i);
    expect(() =>
      createReactDoctorReport({
        scans: [
          scan("apps/admin", [], { skippedChecks: ["dead-code"] }),
          ...scans.slice(1),
        ],
        configHash,
      }),
    ).toThrow(/skipped/i);
  });

  it("reports every failure as unavailable evidence with exit code 1", () => {
    const errors: string[] = [];
    const exitCode = runReactDoctorAuditCommand([], {
      root: "/unused",
      log: () => {},
      logError: (message: string) => errors.push(message),
      runAudit: () => {
        throw new Error(
          "The audit did not complete every required target exactly once.",
        );
      },
    });
    expect(exitCode).toBe(1);
    expect(errors).toEqual([
      "React Doctor audit evidence is unavailable: The audit did not complete every required target exactly once.",
    ]);
  });

  it("rejects --check and other unknown arguments before any scan", () => {
    const runAudit = vi.fn();
    const errors: string[] = [];
    const exitCode = runReactDoctorAuditCommand(["--check"], {
      root: "/unused",
      log: () => {},
      logError: (message: string) => errors.push(message),
      runAudit,
    });
    expect(exitCode).toBe(1);
    expect(runAudit).not.toHaveBeenCalled();
    expect(errors).toEqual([
      "React Doctor audit evidence is unavailable: Unknown audit arguments: --check",
    ]);
  });

  it("parses the supported arguments and rejects ambiguous ones", () => {
    expect(parseReactDoctorAuditArgs([])).toEqual({
      raw: false,
      outputDirectory: undefined,
      changedSince: undefined,
    });
    expect(
      parseReactDoctorAuditArgs([
        "--raw",
        "--output=evidence",
        "--changed-since=origin/develop",
      ]),
    ).toEqual({
      raw: true,
      outputDirectory: "evidence",
      changedSince: "origin/develop",
    });
    expect(() => parseReactDoctorAuditArgs(["--changed-since="])).toThrow(
      /--changed-since/,
    );
    expect(() =>
      parseReactDoctorAuditArgs(["--changed-since=a", "--changed-since=b"]),
    ).toThrow(/--changed-since/);
  });
});

describe("React Doctor findings and summary", () => {
  const scans = () =>
    completeScans({
      "apps/admin": [
        diagnostic("app/page.tsx"),
        diagnostic("app/page.tsx", "no-array-index-as-key", {
          severity: "error",
          line: 9,
          column: 5,
          message: "Array index used as key",
        }),
      ],
      "packages/ui": [diagnostic("components/button.tsx")],
    });

  it("records the version, config hash, base revision and every finding", () => {
    const report = createReactDoctorReport({ scans: scans(), configHash });
    expect(report.findings).toMatchObject({
      profile: "applicable",
      reactDoctorVersion: REACT_DOCTOR_VERSION,
      configHash,
      baseRevision: null,
    });
    expect(report.findings.findings).toEqual([
      {
        target: "apps/admin",
        file: "apps/admin/app/page.tsx",
        line: 4,
        column: 2,
        plugin: "react-doctor",
        rule: "no-tiny-text",
        severity: "warning",
        message: "Finding for no-tiny-text",
      },
      {
        target: "apps/admin",
        file: "apps/admin/app/page.tsx",
        line: 9,
        column: 5,
        plugin: "react-doctor",
        rule: "no-array-index-as-key",
        severity: "error",
        message: "Array index used as key",
      },
      {
        target: "packages/ui",
        file: "packages/ui/components/button.tsx",
        line: 4,
        column: 2,
        plugin: "react-doctor",
        rule: "no-tiny-text",
        severity: "warning",
        message: "Finding for no-tiny-text",
      },
    ]);
    expect(
      createReactDoctorReport({ scans: scans(), configHash, raw: true })
        .findings.profile,
    ).toBe("raw");
  });

  it("gives the totals per target and per rule", () => {
    const report = createReactDoctorReport({ scans: scans(), configHash });
    expect(report.findings.totals).toEqual({
      findings: 3,
      byTarget: {
        "apps/admin": 2,
        "apps/donor": 0,
        "apps/missionary": 0,
        "packages/auth": 0,
        "packages/database": 0,
        "packages/lib": 0,
        "packages/missionary": 0,
        "packages/ui": 1,
      },
      byRule: {
        "react-doctor/no-tiny-text": 2,
        "react-doctor/no-array-index-as-key": 1,
      },
    });
    expect(report.summary).toContain("| `apps/admin` | 2 |");
    expect(report.summary).toContain("| `apps/donor` | 0 |");
    expect(report.summary).toContain("| `packages/ui` | 1 |");
    expect(report.summary).toContain("| `react-doctor/no-tiny-text` | 2 |");
    expect(report.summary).toContain(
      "| `react-doctor/no-array-index-as-key` | 1 |",
    );
    expect(report.summary).toContain("### `apps/admin/app/page.tsx`");
    expect(report.summary).toContain(
      "- 9:5 error `react-doctor/no-array-index-as-key`: Array index used as key",
    );
    expect(report.summary).toContain("### `packages/ui/components/button.tsx`");
  });
});

describe("React Doctor changed-file view", () => {
  it("lists only working-tree changes since the merge base, with totals for everything", () => {
    const root = sharedRepository();
    const changedSince = resolveChangedSince(root, "develop");
    expect(changedSince.revision).toBe("develop");
    expect(changedSince.mergeBase).toBe(git(root, ["rev-parse", "HEAD~1"]));
    expect(changedSince.files).toEqual(changedFiles);

    const report = createReactDoctorReport({
      scans: completeScans(findingsInEveryFixtureFile()),
      configHash,
      changedSince,
    });
    expect(report.listed.map((finding) => finding.file)).toEqual(changedFiles);
    expect(report.findings.baseRevision).toEqual({
      revision: "develop",
      mergeBase: changedSince.mergeBase,
    });
    expect(report.findings.totals.findings).toBe(9);
    expect(report.findings.totals.byTarget["apps/admin"]).toBe(8);
    expect(report.findings.totals.byTarget["packages/ui"]).toBe(1);
    expect(report.findings.findings).toHaveLength(9);
    expect(
      report.findings.findings
        .filter((finding: { changed: boolean }) => finding.changed)
        .map((finding: { file: string }) => finding.file),
    ).toEqual(changedFiles);
    for (const file of changedFiles)
      expect(report.summary).toContain(`### \`${file}\``);
    expect(report.summary).toContain("| `apps/admin` | 8 |");
  });

  it("does not list files changed only by base commits after the merge base", () => {
    const root = sharedRepository();
    const changedSince = resolveChangedSince(root, "develop");
    expect(changedSince.files).not.toContain("apps/admin/base-only.tsx");
    const report = createReactDoctorReport({
      scans: completeScans(findingsInEveryFixtureFile()),
      configHash,
      changedSince,
    });
    for (const file of [
      "apps/admin/base-only.tsx",
      "apps/admin/stable.tsx",
      "apps/admin/ignored.tsx",
      "packages/ui/button.tsx",
    ]) {
      expect(report.listed.map((finding) => finding.file)).not.toContain(file);
      expect(report.summary).not.toContain(`### \`${file}\``);
    }
  });

  it("fails before any scan when the base revision cannot be resolved, naming it", () => {
    const root = sharedRepository();
    expect(() => resolveChangedSince(root, "no-such-ref")).toThrow(
      /no-such-ref/,
    );
    expect(() => resolveChangedSince(root, "--output=elsewhere")).toThrow(
      /--output=elsewhere/,
    );
    const output = path.join(tempRoot("core-doctor-output-"), "audit");
    const scanTarget = vi.fn();
    expect(() =>
      runReactDoctorAudit({
        root,
        outputDirectory: output,
        changedSince: "no-such-ref",
        scanTarget,
      }),
    ).toThrow(/no-such-ref/);
    expect(scanTarget).not.toHaveBeenCalled();
    expect(existsSync(output)).toBe(false);
  });
});

describe("React Doctor audit run", () => {
  it.each([false, true])(
    "writes findings.json and summary.md and exits 0 for a complete scan with findings (raw: %s)",
    (raw) => {
      const root = sharedRepository();
      const output = path.join(tempRoot("core-doctor-output-"), "audit");
      const { exitCode, logs, errors } = runCommand(
        [
          `--output=${output}`,
          "--changed-since=develop",
          ...(raw ? ["--raw"] : []),
        ],
        root,
        fakeScanner(findingsInEveryFixtureFile()),
      );
      expect(errors).toEqual([]);
      expect(exitCode).toBe(0);
      const findings = JSON.parse(
        readFileSync(path.join(output, "findings.json"), "utf8"),
      );
      expect(findings.profile).toBe(raw ? "raw" : "applicable");
      expect(findings.totals.findings).toBe(9);
      expect(findings.baseRevision.revision).toBe("develop");
      const summary = readFileSync(path.join(output, "summary.md"), "utf8");
      expect(summary).toContain("### `apps/admin/edited.tsx`");
      expect(summary).not.toContain("### `apps/admin/stable.tsx`");
      expect(existsSync(path.join(output, "actionable.json"))).toBe(false);
      const printed = logs.join("\n");
      expect(printed).toContain("apps/admin: 8 findings");
      expect(printed).toContain(path.join(output, "findings.json"));
      expect(printed).toContain(path.join(output, "summary.md"));
    },
  );

  it("reports a scan with skipped checks as unavailable evidence and writes no summary", () => {
    const root = sharedRepository();
    const output = path.join(tempRoot("core-doctor-output-"), "audit");
    const { exitCode, errors } = runCommand(
      [`--output=${output}`],
      root,
      fakeScanner(findingsInEveryFixtureFile(), {
        "packages/lib": { skippedChecks: ["dead-code"] },
      }),
    );
    expect(exitCode).toBe(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(
      /^React Doctor audit evidence is unavailable: .*skipped/i,
    );
    expect(existsSync(path.join(output, "findings.json"))).toBe(false);
    expect(existsSync(path.join(output, "summary.md"))).toBe(false);
  });

  it("reports source drift during the scan as unavailable evidence", () => {
    const root = divergedRepository();
    const output = path.join(tempRoot("core-doctor-output-"), "audit");
    const { exitCode, errors } = runCommand(
      [`--output=${output}`],
      root,
      fakeScanner(findingsInEveryFixtureFile(), {}, (target) => {
        if (target === "apps/donor")
          write(root, "apps/admin/stable.tsx", "export const Stable = 2;\n");
      }),
    );
    expect(exitCode).toBe(1);
    expect(errors[0]).toMatch(
      /^React Doctor audit evidence is unavailable: Audit source changed during the scan/,
    );
    expect(existsSync(path.join(output, "findings.json"))).toBe(false);
  });
});
