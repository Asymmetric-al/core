import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const playwrightModule = require.resolve("@playwright/test");
const playwrightCli = require.resolve("@playwright/test/cli");
const smokeConfig = resolve("playwright.development-smoke.config.ts");
const sentinels = {
  email: "artifact+canary@example.test",
  password: "dummy+pw@example.test",
  bypass: "by?+ /x",
};

function createFailingFixture(directory: string, encoded = false) {
  writeFileSync(join(directory, "package.json"), '{"private":true}\n');
  writeFileSync(
    join(directory, "playwright.config.ts"),
    `import config from ${JSON.stringify(smokeConfig)};
export default { ...config, testDir: ${JSON.stringify(directory)} };`,
  );
  writeFileSync(join(directory, "outside-evidence.txt"), sentinels.password);
  writeFileSync(
    join(directory, "admin.artifact-path.spec.ts"),
    `import playwright from ${JSON.stringify(playwrightModule)};
import { writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { once } from "node:events";
const { test, expect } = playwright;
const encoded = ${encoded};
test("preserves a failed auth check with safe evidence", async ({ request }, info) => {
  const server = createServer((req, res) => res.end('{"ok":false}'));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await request.post("http://127.0.0.1:" + server.address().port + "/auth", {
      data: { email: process.env.QA_TEST_EMAIL, password: process.env.QA_TEST_PASSWORD },
    });
    const raw = info.outputPath("raw-error.txt");
    await writeFile(raw, process.env.QA_TEST_PASSWORD);
    await info.attach("raw-error", { path: raw, contentType: "text/plain" });
    info.attachments.push({ name: "outside", path: process.env.OUTSIDE_EVIDENCE_PATH, contentType: "text/plain" });
    await info.attach("evidence.json", {
      body: JSON.stringify({
        url: encoded
          ? "https://preview.example.test/no-access/" + encodeURIComponent(process.env.QA_TEST_PASSWORD)
          : "https://preview.example.test/no-access?token=" + process.env.VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET + "#private-fragment",
        title: encoded
          ? "Access: " + encodeURIComponent(process.env.QA_TEST_PASSWORD) + " | " + encodeURIComponent(process.env.QA_TEST_EMAIL) + " | " + encodeURI(process.env.VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET)
          : "Access: " + process.env.QA_TEST_EMAIL,
        heading: encoded
          ? "Denied: " + Buffer.from(process.env.QA_TEST_PASSWORD).toString("base64") + " | " + Buffer.from(process.env.VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET).toString("base64url")
          : "Denied: " + process.env.QA_TEST_PASSWORD,
        visiblePasswordInputs: 1,
        ignoredPrivateField: process.env.VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET,
        network: encoded ? [
          encodeURIComponent(process.env.QA_TEST_PASSWORD).replace(/%[a-f0-9]{2}/gi, value => value.toLowerCase()),
          new URLSearchParams({value:process.env.VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET}).toString().slice(6),
          Buffer.from(process.env.VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET).toString("base64"),
          Buffer.from(process.env.VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET).toString("base64").replace(/=+$/, ""),
          Buffer.from(process.env.VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET).toString("base64").replaceAll("+", "-").replaceAll("/", "_"),
        ].map(value => ({method:"POST",status:403,url:"https://auth.example.test/reset/"+value})) : [{
          method: "GET", status: 406,
          url: "https://auth.example.test/rest/v1/profiles?email=" + process.env.QA_TEST_EMAIL + "#private-fragment",
          headers: { authorization: process.env.QA_TEST_PASSWORD },
        }],
      }),
      contentType: "application/json",
    });
    await test.step("API login " + process.env.QA_TEST_EMAIL, async () => {
      expect(process.env.QA_TEST_PASSWORD).toBe("deliberate failure");
    });
  } finally {
    server.close();
  }
});`,
  );
}

function runFixture(
  directory: string,
  overrides: { report?: string; output?: string } = {},
  startsTest = true,
) {
  const environment: Record<string, string> = {
    CI: "1",
    FORCE_COLOR: "0",
    QA_TEST_EMAIL: sentinels.email,
    QA_TEST_PASSWORD: sentinels.password,
    VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET: sentinels.bypass,
    OUTSIDE_EVIDENCE_PATH: join(directory, "outside-evidence.txt"),
  };
  // Never inherit real QA or provider credentials into the subprocess.
  for (const key of [
    "PATH",
    "HOME",
    "USERPROFILE",
    "SystemRoot",
    "TEMP",
    "TMP",
  ]) {
    const value = process.env[key];
    if (value) environment[key] = value;
  }
  if (overrides.report !== undefined)
    environment.PLAYWRIGHT_REPORT_DIR = overrides.report;
  if (overrides.output !== undefined)
    environment.PLAYWRIGHT_OUTPUT_DIR = overrides.output;
  const result = spawnSync(
    process.execPath,
    [
      playwrightCli,
      "test",
      "--config",
      join(directory, "playwright.config.ts"),
      "--project",
      "development-admin",
    ],
    { cwd: directory, env: environment, encoding: "utf8", timeout: 30_000 },
  );
  expect(result.error).toBeUndefined();
  expect(result.status, result.stdout + result.stderr).toBe(1);
  expect(result.stdout + result.stderr).toContain(
    startsTest
      ? "Running 1 smoke tests"
      : "Smoke report and test-output directories must be separate run directories.",
  );
  for (const secret of Object.values(sentinels)) {
    expect(result.stdout + result.stderr).not.toContain(secret);
  }
  expect(readFileSync(join(directory, "outside-evidence.txt"), "utf8")).toBe(
    sentinels.password,
  );
}

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

function expectSafeArtifacts(
  directory: string,
  report: string,
  output: string,
  encoded = false,
) {
  const reportDirectory = resolve(directory, report);
  const outputDirectory = resolve(directory, output);
  expect(existsSync(join(reportDirectory, "sanitized/index.html"))).toBe(true);
  const paths = [...files(reportDirectory), ...files(outputDirectory)];
  // Reject opaque binary/compressed attachments instead of trusting a raw grep.
  for (const path of paths) {
    expect([".html", ".json", ".md"]).toContain(extname(path));
    const contents = readFileSync(path, "utf8");
    expect(contents).not.toMatch(/<script|data:|base64|PK\x03\x04/u);
    for (const secret of Object.values(sentinels)) {
      expect(contents).not.toContain(secret);
      expect(contents).not.toContain(Buffer.from(secret).toString("base64"));
      expect(contents).not.toContain(encodeURIComponent(secret));
    }
    expect(contents).not.toContain("private-fragment");
    expect(contents).not.toContain("?token=");
  }
  const bundle = JSON.parse(
    readFileSync(join(reportDirectory, "sanitized/results.json"), "utf8"),
  );
  expect(bundle.status).toBe("failed");
  expect(bundle.tests).toHaveLength(1);
  expect(bundle.tests[0]).toMatchObject({
    title: "preserves a failed auth check with safe evidence",
    project: "development-admin",
    status: "failed",
    evidence: {
      location: {
        origin: "https://preview.example.test",
        pathname: encoded ? "/no-access/[redacted]" : "/no-access",
      },
      title: encoded
        ? "Access: [redacted] | [redacted] | [redacted]"
        : "Access: [redacted]",
      heading: encoded
        ? "Denied: [redacted] | [redacted]"
        : "Denied: [redacted]",
      visiblePasswordInputs: 1,
      network: encoded
        ? Array.from({ length: 5 }, () => ({
            method: "POST",
            status: 403,
            origin: "https://auth.example.test",
            pathname: "/reset/[redacted]",
          }))
        : [
            {
              method: "GET",
              status: 406,
              origin: "https://auth.example.test",
              pathname: "/rest/v1/profiles",
            },
          ],
    },
  });
  expect(bundle.tests[0].duration).toBeGreaterThan(0);
  const evidence = paths.filter((path) => path.endsWith("evidence.json"));
  expect(evidence).toHaveLength(1);
  expect(JSON.parse(readFileSync(evidence[0]!, "utf8"))).toEqual(
    bundle.tests[0],
  );
}

describe("development smoke artifact output", () => {
  it("redacts URL and base64 canaries placed in retained fields", () => {
    const directory = mkdtempSync(join(tmpdir(), "core-smoke-encoded-"));
    try {
      createFailingFixture(directory, true);
      runFixture(directory);
      expectSafeArtifacts(
        directory,
        "playwright-report/development-smoke",
        "test-results",
        true,
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("leaves no uploadable bundle when reporter completion fails", () => {
    const directory = mkdtempSync(
      join(tmpdir(), "core-smoke-reporter-failure-"),
    );
    try {
      createFailingFixture(directory);
      writeFileSync(
        join(directory, "crashing-reporter.ts"),
        `import SafeReporter from ${JSON.stringify(resolve("tests/e2e/development-smoke/safe-reporter.ts"))};
export default class extends SafeReporter { onEnd() { throw new Error("Controlled reporter completion failure"); } }`,
      );
      writeFileSync(
        join(directory, "playwright.config.ts"),
        `import config from ${JSON.stringify(smokeConfig)};
export default {...config, testDir:${JSON.stringify(directory)}, reporter:[[${JSON.stringify(join(directory, "crashing-reporter.ts"))},{outputFolder:"playwright-report/pr-preview-smoke-admin"}]]};`,
      );
      runFixture(directory, {
        report: "playwright-report/pr-preview-smoke-admin",
        output: "test-results/pr-preview-smoke-admin",
      });
      expect(
        files(join(directory, "test-results")).some((path) =>
          readFileSync(path, "utf8").includes(sentinels.password),
        ),
      ).toBe(true);
      expect(
        existsSync(
          join(
            directory,
            "playwright-report/pr-preview-smoke-admin/sanitized/index.html",
          ),
        ),
      ).toBe(false);
      expect(
        existsSync(
          join(
            directory,
            "playwright-report/pr-preview-smoke-admin/sanitized/results.json",
          ),
        ),
      ).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60_000);

  it.each([
    { report: ".", output: "test-results" },
    { report: "playwright-report/guard", output: "." },
  ])(
    "rejects workspace output roots before startup cleanup: %j",
    (override) => {
      const directory = mkdtempSync(join(tmpdir(), "core-smoke-root-guard-"));
      try {
        createFailingFixture(directory);
        const config = readFileSync(
          join(directory, "playwright.config.ts"),
          "utf8",
        );
        runFixture(directory, override, false);
        expect(
          readFileSync(join(directory, "playwright.config.ts"), "utf8"),
        ).toBe(config);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
    60_000,
  );

  it("retains safe failures from separate workflow-selected surface paths", () => {
    const directory = mkdtempSync(join(tmpdir(), "core-preview-artifacts-"));
    try {
      createFailingFixture(directory);
      for (const surface of ["admin", "donor"]) {
        runFixture(directory, {
          report: `playwright-report/pr-preview-smoke-${surface}`,
          output: `test-results/pr-preview-smoke-${surface}`,
        });
      }
      for (const surface of ["admin", "donor"]) {
        expectSafeArtifacts(
          directory,
          `playwright-report/pr-preview-smoke-${surface}`,
          `test-results/pr-preview-smoke-${surface}`,
        );
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("keeps safe local defaults when overrides are blank", () => {
    const directory = mkdtempSync(
      join(tmpdir(), "core-development-artifacts-"),
    );
    try {
      createFailingFixture(directory);
      runFixture(directory, { report: " ", output: " " });
      expectSafeArtifacts(
        directory,
        "playwright-report/development-smoke",
        "test-results",
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60_000);
});
