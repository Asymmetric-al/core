import { describe, expect, it } from "vitest";

import {
  buildMarkdownReport,
  buildReport,
  categorizeFailure,
  parseFailedTests,
  parseVitestSummary,
  recommendedAction,
} from "../../../scripts/verify/unit-feedback.mjs";

describe("unit feedback report helpers", () => {
  it("parses a passing Vitest summary", () => {
    const summary = parseVitestSummary(
      `
 RUN  v4.1.4 C:/Users/Conrad/Documents/GitHub/core

 Test Files  100 passed (100)
      Tests  421 passed | 2 skipped (423)
   Duration  15.72s (transform 14.01s)
`,
      0,
    );

    expect(summary.status).toBe("pass");
    expect(summary.testFiles.passed).toBe(100);
    expect(summary.tests.passed).toBe(421);
    expect(summary.tests.skipped).toBe(2);
    expect(summary.duration).toContain("15.72s");
  });

  it("extracts actionable failure rows from Vitest output", () => {
    const failures = parseFailedTests(`
 FAIL  tests/unit/apps/admin/tanstack-surface-imports.test.ts > admin TanStack surface migrations > routes contributions through shared database hooks and responsive table
AssertionError: expected 'import PageClient from "./page-client";' to match /useAdminContributions/
 at tests/unit/apps/admin/tanstack-surface-imports.test.ts:23:24
`);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({
      testFile: "tests/unit/apps/admin/tanstack-surface-imports.test.ts",
      category: "server/client boundary",
      nextAction: "fix now",
    });
    expect(failures[0].recommendedAction).toContain("page-client");
  });

  it("categorizes known remediation failure surfaces", () => {
    expect(
      categorizeFailure({
        testFile: "tests/unit/donor-imports.test.ts",
        testName: "does not import donor barrel",
        assertion: "@/features/donor/components should not be imported",
        block: "",
      }),
    ).toBe("import path");

    expect(
      categorizeFailure({
        testFile: "tests/unit/rich-text.test.ts",
        testName: "documents raw images",
        assertion: "<img should only appear in image-view",
        block: "packages/ui/components/shadcn/rich-text-editor/image-view.tsx",
      }),
    ).toBe("rich-text image policy");
  });

  it("builds the requested structured Markdown report", () => {
    const report = buildReport({
      baseline: {
        status: 1,
        stdout: `
 Test Files  1 failed (1)
      Tests  1 failed (1)
   Duration  2.00s
`,
        stderr: "",
      },
      coverageCaveat:
        "Development fallback coverage provider; line/statement/branch totals are not computed. totalScripts: 0.",
      failures: [
        {
          testFile: "tests/unit/example.test.ts",
          testName: "keeps page wrapper server-only",
          assertion:
            "AssertionError: expected page.tsx not to contain use client",
          affectedSourcePath: "apps/admin/app/example/page.tsx",
          category: "server/client boundary",
          recommendedAction: recommendedAction("server/client boundary"),
          nextAction: "fix now",
        },
      ],
      reportDir: "test-results/unit-feedback",
      reruns: [
        {
          testFile: "tests/unit/example.test.ts",
          command: "bunx vitest run tests/unit/example.test.ts",
          status: "fail",
          exitCode: 1,
        },
      ],
    });

    const markdown = buildMarkdownReport(report);

    expect(markdown).toContain("Status: FAIL");
    expect(markdown).toContain("| Test file | Test name | Assertion |");
    expect(markdown).toContain("server/client boundary");
    expect(markdown).toContain("Targeted Reruns");
  });
});
