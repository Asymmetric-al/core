import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Playwright run reporting", () => {
  it("streams test progress while preserving finalized HTML and JSON reports", async () => {
    vi.stubEnv("PLAYWRIGHT_REPORT_DIR", "");
    vi.resetModules();
    const { default: config } = await import("../../playwright.config");
    expect(config.reporter[0]).toEqual([
      path.resolve("tests/e2e/run-progress-reporter.ts"),
      { outputFile: "playwright-report-run-status.json" },
    ]);
    expect(config.reporter).toEqual(
      expect.arrayContaining([
        ["list"],
        ["html", { outputFolder: "playwright-report" }],
        [
          "json",
          { outputFile: path.join("playwright-report", "results.json") },
        ],
      ]),
    );
  });

  it("isolates each invocation and retains a running verdict until finalization", async () => {
    const directory = "playwright-report/production-gate";
    vi.stubEnv("PLAYWRIGHT_REPORT_DIR", directory);
    vi.resetModules();
    const { default: config } = await import("../../playwright.config");
    expect(config.outputDir).toBe(path.join("test-results", "production-gate"));
    expect(config.reporter).toEqual([
      [
        path.resolve("tests/e2e/run-progress-reporter.ts"),
        {
          outputFile: path.join(
            "playwright-report",
            "production-gate-run-status.json",
          ),
        },
      ],
      ["list"],
      ["html", { outputFolder: directory }],
      ["json", { outputFile: path.join(directory, "results.json") }],
    ]);
  });

  it("keeps raw artifacts from separate stages in separate directories", async () => {
    vi.stubEnv("PLAYWRIGHT_REPORT_DIR", "playwright-report/auth-preflight");
    vi.resetModules();
    const { default: preflight } = await import("../../playwright.config");
    expect(preflight.outputDir).toBe(
      path.join("test-results", "auth-preflight"),
    );
    expect(preflight.reporter[0]).toEqual([
      path.resolve("tests/e2e/run-progress-reporter.ts"),
      {
        outputFile: path.join(
          "playwright-report",
          "auth-preflight-run-status.json",
        ),
      },
    ]);
    vi.stubEnv("PLAYWRIGHT_REPORT_DIR", "");
    vi.resetModules();
    const { default: normal } = await import("../../playwright.config");
    expect(normal.outputDir).toBe("test-results");
  });

  it("binds isolated servers to their own auth surface even on alternate ports", async () => {
    vi.stubEnv("PLAYWRIGHT_BASE_URL", "http://localhost:3008");
    vi.stubEnv("PLAYWRIGHT_ADMIN_BASE_URL", "http://localhost:3038");
    vi.stubEnv("PLAYWRIGHT_INCLUDE_ADMIN", "1");
    vi.stubEnv("ASYM_E2E_AUTH_SURFACE", "missionary");
    vi.resetModules();
    const { default: config } = await import("../../playwright.config");
    const servers = Array.isArray(config.webServer) ? config.webServer : [];
    expect(servers).toHaveLength(2);
    expect(servers[0]?.env?.ASYM_E2E_AUTH_SURFACE).toBe("donor");
    expect(servers[1]?.env?.ASYM_E2E_AUTH_SURFACE).toBe("admin");
  });
});
