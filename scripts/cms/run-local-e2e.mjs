if (process.argv.includes("--phase24-contract-check")) {
  const { runPhase24ContractCheck } =
    await import("./phase24-contract-check.mjs");
  process.exitCode = await runPhase24ContractCheck(
    process.argv.slice(2),
    import.meta.url,
  );
} else {
  const [
    { default: nextEnv },
    { repoRoot },
    { runCommand },
    { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD },
  ] = await Promise.all([
    import("@next/env"),
    import("./lib/paths.mjs"),
    import("./lib/process.mjs"),
    import("./lib/local-data.mjs"),
  ]);

  const { loadEnvConfig } = nextEnv;

  loadEnvConfig(repoRoot);
  // The seeded login the local CMS seed creates (the published local fixture
  // of scripts/cms/lib/local-data.mjs), unless the environment names another:
  // cms:local:verify requires both, and the spec signs in through the form
  // with them.
  process.env.DEMO_ADMIN_EMAIL ||= DEMO_ADMIN_EMAIL;
  process.env.DEMO_PASSWORD ||= DEMO_ADMIN_PASSWORD;

  runCommand(
    "verify local CMS before strict E2E",
    "bun",
    ["run", "cms:local:verify"],
    {
      cwd: repoRoot,
    },
  );

  runCommand(
    "run strict local CMS E2E suite",
    "node",
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "tests/e2e/cms-local-happy-path.spec.ts",
      "--project=chromium",
      "--workers=1",
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        ALLOW_DEMO_ACCOUNTS: process.env.ALLOW_DEMO_ACCOUNTS || "true",
        CMS_BASE_URL: "http://localhost:3030",
        CMS_LOCAL_STRICT: "1",
        DONOR_APP_URL: "http://localhost:3005",
        E2E_AUTH_BYPASS: "false",
        NEXT_PUBLIC_DONOR_URL: "http://localhost:3005",
        PLAYWRIGHT_ADMIN_BASE_URL: "http://localhost:3030",
        PLAYWRIGHT_BASE_URL: "http://localhost:3005",
        PLAYWRIGHT_DONOR_URL: "http://localhost:3005",
        PLAYWRIGHT_INCLUDE_ADMIN: "1",
        // The bodyless-delete case needs the missionary app; Playwright
        // starts it in strict local mode (playwright.config.ts).
        PLAYWRIGHT_MISSIONARY_BASE_URL:
          process.env.PLAYWRIGHT_MISSIONARY_BASE_URL || "http://localhost:4000",
        SKIP_E2E_AUTH: "1",
      },
    },
  );
}
