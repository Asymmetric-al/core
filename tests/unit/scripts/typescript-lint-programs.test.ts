// Typed controls for the central-test lint-context programs (TS-3, design L9, VR-7).
//
// For each program a passing and a failing twin are written into a directory the program owns and
// linted together through the real launcher with `--typed`. Both twins import through the program's
// aliases and assign the result to an annotated binding: if an alias did not resolve, the import would
// be `any` and the `no-unsafe-*` rules would report on the passing twin. The failing twin asserts an
// index read to `string`; `non-nullable-type-assertion-style` reports that only when
// `strictNullChecks` and `noUncheckedIndexedAccess` give the read `string | undefined`. In the inferred,
// non-strict program TSRS falls back to without a directory-rooted tsconfig, the same line reports
// `no-unnecessary-type-assertion` instead (E28).
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { listedPrograms } from "../../../scripts/verify/typescript-programs.mts";
import {
  invoke,
  removeFixture,
  root,
  timeout,
} from "../../fixtures/quality/launcher.ts";

type Control = {
  /** The lint-context program under test. */
  program: string;
  /** Where the twins are written; the program must be the nearest tsconfig.json above it. */
  directory: string;
  /** Imports through the program's aliases, and uses that are safe only when they resolve. */
  source: string;
};

const workspaceImport = `import { csvSafeCell } from "@asym/lib/csv";

export const cell: string = csvSafeCell("value");
`;
const donorAlias = `import { todayDateInputValue } from "@/lib/dates";

export const today: string = todayDateInputValue();
`;
const payloadAlias = `import configPromise from "@payload-config";

export const pendingConfig: Promise<unknown> = configPromise;
`;

const controls: readonly Control[] = [
  {
    program: "tests/tsconfig.json",
    directory: "tests/unit/packages/api",
    source: workspaceImport,
  },
  {
    program: "tests/unit/apps/admin/tsconfig.json",
    directory: "tests/unit/apps/admin",
    source: `import configPromise from "@payload-config";
import { formatAttachmentSize } from "@/features/support-hub/lib/attachment-size";

export const pendingConfig: Promise<unknown> = configPromise;
export const sizeLabel: string = formatAttachmentSize(2048);
`,
  },
  {
    program: "tests/unit/apps/donor/tsconfig.json",
    directory: "tests/unit/apps/donor",
    source: donorAlias,
  },
  {
    program: "tests/unit/apps/missionary/tsconfig.json",
    directory: "tests/unit/apps/missionary",
    source: `import { isMissionaryWorkspacePath } from "@/lib/route-policy";

export const isWorkspace: boolean = isMissionaryWorkspacePath("/dashboard");
`,
  },
  {
    program: "tests/unit/acceptance/issue-2364/tsconfig.json",
    directory: "tests/unit/acceptance/issue-2364",
    source: donorAlias,
  },
  {
    program: "tests/unit/packages/ui/tsconfig.json",
    directory: "tests/unit/packages/ui",
    source: `import { cn } from "@/lib/utils";

export const className: string = cn("a", "b");
`,
  },
  {
    program: "tests/unit/cms/tsconfig.json",
    directory: "tests/unit/cms",
    source: payloadAlias,
  },
  {
    program: "tests/unit/packages/api/principal/tsconfig.json",
    directory: "tests/unit/packages/api/principal",
    source: workspaceImport,
  },
  {
    program: "tests/unit/packages/api/projection/tsconfig.json",
    directory: "tests/unit/packages/api/projection",
    source: workspaceImport,
  },
];

const passingTail = `
export const firstValue = (values: readonly string[]): string =>
  values[0] ?? "";
`;
const failingTail = `
export const firstValue = (values: readonly string[]): string =>
  values[0] as string;
`;
const strictFinding = "typescript(non-nullable-type-assertion-style)";
const nonStrictFinding = "typescript(no-unnecessary-type-assertion)";

type Diagnostic = { code: string; filename: string; message: string };
type Twins = {
  control: Control;
  directory: string;
  passing: string;
  failing: string;
};

const toRepoPath = (file: string) =>
  path.relative(root, path.resolve(root, file)).split(path.sep).join("/");

function nearestConfig(directory: string) {
  let current = path.join(root, directory);
  while (current.startsWith(root)) {
    const config = path.join(current, "tsconfig.json");
    if (existsSync(config)) return toRepoPath(config);
    current = path.dirname(current);
  }
  return null;
}

function parseDiagnostics(stdout: string): Diagnostic[] {
  const report: unknown = JSON.parse(stdout);
  if (
    typeof report !== "object" ||
    report === null ||
    !("diagnostics" in report) ||
    !Array.isArray(report.diagnostics)
  )
    throw new Error(`Unexpected launcher report: ${stdout}`);
  return report.diagnostics.map((item: unknown): Diagnostic => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("code" in item) ||
      !("filename" in item) ||
      typeof item.code !== "string" ||
      typeof item.filename !== "string"
    )
      throw new Error(`Unexpected diagnostic: ${JSON.stringify(item)}`);
    const message =
      "message" in item && typeof item.message === "string" ? item.message : "";
    return { code: item.code, filename: toRepoPath(item.filename), message };
  });
}

describe("central-test lint-context programs", () => {
  it("gives every lint-context program a control whose directory resolves to it", () => {
    const lintContext = listedPrograms
      .filter((program) => program.role === "lint-context")
      .map((program) => program.config)
      .sort();
    expect(controls.map((control) => control.program).sort()).toEqual(
      lintContext,
    );
    for (const control of controls)
      expect(nearestConfig(control.directory), control.directory).toBe(
        control.program,
      );
  });

  describe("typed controls", () => {
    let twins: Twins[] = [];
    let diagnostics: Diagnostic[] = [];
    let output = "";
    let status: number | null = null;

    beforeAll(() => {
      twins = controls.map((control) => {
        // No leading dot: TypeScript wildcards skip dot-directories, so the program would not include it.
        const directory = mkdtempSync(
          path.join(root, control.directory, "typed-control-"),
        );
        const passing = path.join(directory, "passing.ts");
        const failing = path.join(directory, "failing.ts");
        writeFileSync(passing, control.source + passingTail);
        writeFileSync(failing, control.source + failingTail);
        return {
          control,
          directory,
          passing: toRepoPath(passing),
          failing: toRepoPath(failing),
        };
      });
      const result = invoke([
        "--typed",
        "--format",
        "json",
        ...twins.flatMap(({ passing, failing }) => [passing, failing]),
      ]);
      output = result.output;
      status = result.status;
      diagnostics = parseDiagnostics(result.stdout);
    }, timeout);

    afterAll(() => {
      for (const { control, directory } of twins)
        removeFixture(path.join(root, control.directory), directory);
    });

    it("reports findings and no tool failure", () => {
      expect(status, output).toBe(1);
    });

    it.each(controls.map((control) => [control.program, control] as const))(
      "%s: the failing twin reports the strict-only finding and its passing twin reports nothing",
      (_program, control) => {
        const pair = twins.find((twin) => twin.control === control);
        if (!pair) throw new Error(`No twins for ${control.program}`);
        const of = (file: string) =>
          diagnostics
            .filter((diagnostic) => diagnostic.filename === file)
            .map((diagnostic) => `${diagnostic.code} ${diagnostic.message}`);
        expect(of(pair.passing), output).toEqual([]);
        const failing = of(pair.failing);
        expect(
          failing.some((line) => line.startsWith(strictFinding)),
          output,
        ).toBe(true);
        expect(
          failing.filter(
            (line) =>
              line.startsWith(nonStrictFinding) ||
              line.startsWith("typescript(no-unsafe-assignment)") ||
              line.startsWith("typescript(no-unsafe-call)"),
          ),
          output,
        ).toEqual([]);
      },
    );
  });
});
