import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import vitestConfig from "../../../vitest.config";

const repoRoot = process.cwd();

const DONOR_UNIT_SMOKE_FILES = [
  "tests/unit/apps/donor/donor-dashboard-bootstrap.test.ts",
  "tests/unit/apps/donor/donor-history-tanstack.test.ts",
  "tests/unit/apps/donor/next-config-images.test.ts",
] as const;

const MISSIONARY_UNIT_SMOKE_FILES = [
  "tests/unit/apps/missionary/donors-page-view-model-contract.test.ts",
  "tests/unit/apps/missionary/donors-tanstack.test.ts",
  "tests/unit/apps/missionary/app/access.test.ts",
] as const;

describe("donor and missionary unit smoke contract", () => {
  it("keeps baseline donor app unit smoke files on disk", () => {
    for (const relativePath of DONOR_UNIT_SMOKE_FILES) {
      expect(existsSync(path.join(repoRoot, relativePath))).toBe(true);
    }
  });

  it("keeps baseline missionary app unit smoke files on disk", () => {
    for (const relativePath of MISSIONARY_UNIT_SMOKE_FILES) {
      expect(existsSync(path.join(repoRoot, relativePath))).toBe(true);
    }
  });

  it("includes tests/unit in vitest discovery", () => {
    const testConfig = vitestConfig.test;
    const include =
      testConfig && typeof testConfig === "object" && "include" in testConfig
        ? testConfig.include
        : undefined;

    expect(include).toEqual(
      expect.arrayContaining([
        "tests/unit/**/*.test.ts",
        "tests/unit/**/*.test.tsx",
      ]),
    );
  });

  it("loads unit-env setup before app unit tests run", () => {
    const testConfig = vitestConfig.test;
    const setupFiles =
      testConfig && typeof testConfig === "object" && "setupFiles" in testConfig
        ? testConfig.setupFiles
        : undefined;

    expect(setupFiles).toContain("./tests/setup/unit-env.ts");
    expect(existsSync(path.join(repoRoot, "tests/setup/unit-env.ts"))).toBe(
      true,
    );
  });

  it("mocks Resend validation in connect tests without replacing @asym/email", () => {
    const connectSource = readFileSync(
      path.join(repoRoot, "tests/unit/packages/api/email/connect.test.ts"),
      "utf8",
    );

    expect(connectSource).toContain(
      'vi.mock("@asym/email", async (importOriginal)',
    );
    expect(connectSource).toContain(
      "validateResendApiKey: validateResendApiKeyMock",
    );
    expect(connectSource).not.toMatch(
      /vi\.mock\("@asym\/email"\s*,\s*\(\)\s*=>\s*\(\{/,
    );
  });
});
