import { execFile, spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

const require = createRequire(import.meta.url);
const fixtures: string[] = [];

afterEach(() => {
  for (const directory of fixtures.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

function runScript(
  script: string,
  args: string[],
  mode: string,
  signals: Record<string, string> = {},
  governanceProbeSource?: string,
) {
  const directory = mkdtempSync(path.join(tmpdir(), "core-eve-build-cli-"));
  fixtures.push(directory);
  mkdirSync(path.join(directory, "scripts"));
  copyFileSync(
    "packages/eve-runtime/scripts/build.mjs",
    path.join(directory, "scripts/build.mjs"),
  );
  if (governanceProbeSource !== undefined) {
    writeFileSync(
      path.join(directory, "scripts/check-production-governance.ts"),
      governanceProbeSource,
    );
  }
  const pkg = JSON.parse(
    readFileSync("packages/eve-runtime/package.json", "utf8"),
  );
  writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ type: "module", scripts: pkg.scripts }),
  );
  const sdk = path.join(directory, "node_modules/eve");
  mkdirSync(path.join(sdk, "bin"), { recursive: true });
  writeFileSync(
    path.join(sdk, "package.json"),
    JSON.stringify({ name: "eve", type: "module" }),
  );
  writeFileSync(
    path.join(sdk, "bin/eve.js"),
    '#!/usr/bin/env node\nimport {writeFileSync} from "node:fs"; writeFileSync(process.env.EVE_BUILD_TEST_OUTPUT, JSON.stringify(process.argv.slice(2)));\n',
    { mode: 0o755 },
  );
  mkdirSync(path.join(directory, "node_modules/.bin"));
  symlinkSync(
    path.join(sdk, "bin/eve.js"),
    path.join(directory, "node_modules/.bin/eve"),
  );
  mkdirSync(path.join(directory, "node_modules/@asym"));
  symlinkSync(
    path.resolve(path.dirname(require.resolve("@asym/env/target-env")), ".."),
    path.join(directory, "node_modules/@asym/env"),
    "dir",
  );
  const output = path.join(directory, "sdk-argv.json");
  const result = spawnSync("bun", ["run", script, ...args], {
    cwd: directory,
    env: {
      PATH: process.env.PATH,
      CORE_EVE_BUILD_MODE: mode,
      EVE_BUILD_TEST_OUTPUT: output,
      ...signals,
    },
    encoding: "utf8",
    timeout: 15_000,
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    stderr: result.stderr,
    sdkArgs: existsSync(output)
      ? JSON.parse(readFileSync(output, "utf8"))
      : null,
  };
}

describe("named Eve build commands", () => {
  it.each([
    { args: ["--service"] },
    { args: ["--service", "--skip-sandbox-prewarm"] },
  ])(
    "rejects a forwarded service selector on explicit full builds (%j)",
    ({ args }) => {
      const result = runScript("build:full", args, "artifacts", {
        VERCEL: "1",
        VERCEL_ENV: "preview",
        VERCEL_TARGET_ENV: "core-development",
      });
      expect(result.status, JSON.stringify(result.sdkArgs)).not.toBe(0);
      expect(result.sdkArgs).toBeNull();
    },
  );

  it("keeps explicit full qualification despite inherited artifact mode", () => {
    const result = runScript(
      "build:full",
      ["--profile", "report.json"],
      "artifacts",
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.sdkArgs).toEqual(["build", "--profile", "report.json"]);
  });

  it("rejects a skip flag on the explicit full command before starting Eve", () => {
    const result = runScript(
      "build:full",
      ["--skip-sandbox-prewarm"],
      "artifacts",
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "--skip-sandbox-prewarm is only supported in artifacts mode.",
    );
    expect(result.sdkArgs).toBeNull();
  });

  it("keeps the explicit artifact command distinct from inherited full mode", () => {
    const result = runScript("build:artifacts", [], "full");
    expect(result.status, result.stderr).toBe(0);
    expect(result.sdkArgs).toEqual(["build", "--skip-sandbox-prewarm"]);
  });

  it("skips sandbox prewarm for hosted production build:service only when persisted governance reports release_disabled", () => {
    const result = runScript(
      "build:service",
      [],
      "full",
      {
        VERCEL: "1",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      },
      'process.stdout.write(JSON.stringify({ allowed: false, reason: "release_disabled" }) + "\\n");\n',
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.sdkArgs).toEqual(["build", "--skip-sandbox-prewarm"]);
  });

  it.each([
    [
      "governance_unavailable",
      'process.stdout.write(JSON.stringify({ allowed: false, reason: "governance_unavailable" }) + "\\n");\n',
    ],
    [
      "emergency_off",
      'process.stdout.write(JSON.stringify({ allowed: false, reason: "emergency_off" }) + "\\n");\n',
    ],
    [
      "governance_allowed",
      'process.stdout.write(JSON.stringify({ allowed: true, reason: "governance_allowed" }) + "\\n");\n',
    ],
    ["helper crash", "process.exit(1);\n"],
  ])(
    "retains full prewarm for hosted production build:service when governance reports %s",
    (_label, probeSource) => {
      const result = runScript(
        "build:service",
        [],
        "artifacts",
        {
          VERCEL: "1",
          VERCEL_ENV: "production",
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        },
        probeSource,
      );
      expect(result.status, result.stderr).toBe(0);
      expect(result.sdkArgs).toEqual(["build"]);
    },
  );

  it("real production governance helper fails closed to governance_unavailable when credentials are absent", () => {
    const result = spawnSync(
      "bun",
      ["--no-env-file", "scripts/check-production-governance.ts"],
      {
        cwd: path.resolve("packages/eve-runtime"),
        env: { PATH: process.env.PATH },
        encoding: "utf8",
        timeout: 15_000,
      },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    const lastLine = result.stdout.trim().split(/\r?\n/).at(-1) ?? "";
    expect(JSON.parse(lastLine)).toEqual({
      allowed: false,
      reason: "governance_unavailable",
    });
  });

  it("real production governance probe handles canonical and padded production Vercel signals end-to-end against loopback PostgREST", async () => {
    let requests = 0;
    let row: Record<string, unknown> = {
      release_enabled: false,
      emergency_off: false,
      kill_switch_state: {
        all_automation: true,
        active_runs: true,
        github_actions: true,
        production_writes: true,
        sandbox_networking: true,
        dynamic_workflows: true,
        model_policy_changes: true,
        force_approval: true,
      },
      policy_status: "not_configured",
      policy_summary: null,
      state_version: 1,
      updated_at: "2026-11-22T00:00:00.000Z",
    };

    const server = createServer((req, res) => {
      requests += 1;
      if (req.url?.startsWith("/rest/v1/eve_governance_state")) {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(row));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    try {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Expected TCP loopback address");
      }
      const baseEnv: Record<string, string> = {
        PATH: process.env.PATH ?? "",
        VERCEL: "1",
        NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${address.port}`,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
        STRIPE_SECRET_KEY: "sk_test_1234567890",
        STRIPE_WEBHOOK_SECRET: "whsec_test_1234567890",
        INNGEST_EVENT_KEY: "test-inngest-event-key",
        INNGEST_SIGNING_KEY: "signkey-test-1234567890",
        RESEND_API_KEY: "re_test_1234567890",
        RESEND_WEBHOOK_SECRET: "whsec_test_1234567890",
        RESEND_ENCRYPTION_KEY: "a".repeat(32),
        SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
        NEXT_PUBLIC_SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_1234567890",
        NEXT_PUBLIC_APP_URL: "https://admin.asymmetric.al",
        NEXT_PUBLIC_SITE_URL: "https://admin.asymmetric.al",
        NEXT_PUBLIC_MAIN_DOMAIN: "asymmetric.al",
      };

      const runRealDispatcher = async (extraEnv: Record<string, string>) => {
        const harness = `
          import { runEveBuild } from "./scripts/build.mjs";
          let captured = null;
          const status = runEveBuild({
            service: true,
            spawn: (_cmd, args) => { captured = args; return { status: 0 }; },
          });
          process.stdout.write("CAPTURED:" + JSON.stringify({ status, args: captured }) + "\\n");
        `;
        const { stdout } = await execFileAsync(
          process.execPath,
          ["--input-type=module", "-e", harness],
          {
            cwd: path.resolve("packages/eve-runtime"),
            env: { ...baseEnv, ...extraEnv },
            timeout: 15_000,
          },
        );
        const line = stdout
          .split(/\r?\n/u)
          .findLast((entry) => entry.startsWith("CAPTURED:"));
        if (!line) throw new Error(`Missing CAPTURED output: ${stdout}`);
        return JSON.parse(line.slice("CAPTURED:".length)) as {
          status: number;
          args: string[];
        };
      };

      // 1. Canonical production + release_disabled -> skips prewarm
      requests = 0;
      const canonical = await runRealDispatcher({ VERCEL_ENV: "production" });
      expect(requests).toBe(1);
      expect(canonical.status).toBe(0);
      expect(canonical.args).toEqual([
        expect.any(String),
        "build",
        "--skip-sandbox-prewarm",
      ]);

      // 2. Padded conflicting preview + production target + release_disabled -> normalizes env & skips prewarm
      requests = 0;
      const padded = await runRealDispatcher({
        VERCEL_ENV: " Preview ",
        VERCEL_TARGET_ENV: " Production ",
      });
      expect(requests).toBe(1);
      expect(padded.status).toBe(0);
      expect(padded.args).toEqual([
        expect.any(String),
        "build",
        "--skip-sandbox-prewarm",
      ]);

      // 3. Emergency-off with release_disabled -> emergency_off takes precedence -> retains full prewarm
      row = { ...row, emergency_off: true };
      requests = 0;
      const emergency = await runRealDispatcher({ VERCEL_ENV: "production" });
      expect(requests).toBe(1);
      expect(emergency.status).toBe(0);
      expect(emergency.args).toEqual([expect.any(String), "build"]);

      // 4. Release enabled -> retains full prewarm
      row = { ...row, emergency_off: false, release_enabled: true };
      requests = 0;
      const enabled = await runRealDispatcher({ VERCEL_ENV: "production" });
      expect(requests).toBe(1);
      expect(enabled.status).toBe(0);
      expect(enabled.args).toEqual([expect.any(String), "build"]);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
