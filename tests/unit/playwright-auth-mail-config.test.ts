import { readdirSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  loadWorkflowDocument,
  type WorkflowStep,
} from "./helpers/workflow-yaml";
import { adminServerLogFile } from "../e2e/helpers/auth-mail";

/**
 * The auth email journeys' dev servers (playwright.auth-mail.config.ts).
 * Mission Control and the missionary workspace serve every signed-in page
 * through their proxy's rewrite of the tenant address (AL-2675, record D-19).
 * On a server bound to a loopback IP literal, Next sends that rewrite out of
 * the server and the proxy answers 500, so those two apps bind the loopback
 * name, resolved IPv4 first, as scripts/github/e2e-dev-server.sh does for CI.
 * They still answer on 127.0.0.1, where the readiness probes and the email
 * links' redirect allowlist expect them.
 */

const { default: config } = await import("../../playwright.auth-mail.config");

type Server = {
  command: string;
  url: string;
  env?: Record<string, string>;
};

function serversOf(loaded: typeof config): Server[] {
  return (
    Array.isArray(loaded.webServer) ? loaded.webServer : [loaded.webServer]
  ) as Server[];
}

function server(app: string, loaded: typeof config = config): Server {
  const servers = serversOf(loaded);
  const found = servers.find((s) => s.command.includes(`apps/${app} `));
  if (!found) throw new Error(`no web server for ${app}`);
  return found;
}

describe("the auth email suite's dev servers", () => {
  it.each(["admin", "missionary"])(
    "binds %s, whose proxy rewrites the tenant address, by the loopback name resolved IPv4 first",
    (app) => {
      const { command, url, env } = server(app);
      expect(command).toMatch(/--hostname localhost$/);
      expect(env?.NODE_OPTIONS ?? "").toContain("--dns-result-order=ipv4first");
      expect(new URL(url).hostname).toBe("127.0.0.1");
    },
  );

  it("keeps the donor portal, which has no tenant address, on 127.0.0.1", () => {
    const { command, url, env } = server("donor");
    expect(command).toMatch(/--hostname 127\.0\.0\.1$/);
    expect(env?.NODE_OPTIONS ?? "").not.toContain("--dns-result-order");
    expect(new URL(url).hostname).toBe("127.0.0.1");
  });
});

describe("AL-2675 WP2c part 2a, T7: the operator area journey", () => {
  const adminPort = Number(process.env.AUTH_MAIL_ADMIN_PORT || 3130);

  it("runs auth-operator-area.spec.ts beside every earlier journey", () => {
    expect(config.testMatch).toEqual([
      "**/auth-password-recovery.spec.ts",
      "**/auth-signup-confirmation.spec.ts",
      "**/auth-two-organizations.spec.ts",
      "**/auth-request-scope-reads.spec.ts",
      "**/auth-crm-reads.spec.ts",
      "**/auth-member-care.spec.ts",
      "**/auth-members-invitations.spec.ts",
      "**/auth-sites-settings.spec.ts",
      "**/auth-operator-area.spec.ts",
    ]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("gives only Mission Control's server an operations address, its own localhost port", () => {
    expect(server("admin").env?.OPERATIONS_NAMES).toBe(
      `localhost:${adminPort}`,
    );
    expect(server("donor").env?.OPERATIONS_NAMES).toBeUndefined();
    expect(server("missionary").env?.OPERATIONS_NAMES).toBeUndefined();
  });

  it("B12: sets its own operations list whatever the shell exports, admitting localhost and not 127.0.0.1", async () => {
    vi.stubEnv("OPERATIONS_NAMES", "evil.example,127.0.0.1:3130");
    vi.resetModules();
    const { default: fresh } =
      await import("../../playwright.auth-mail.config");
    expect(server("admin", fresh).env?.OPERATIONS_NAMES).toBe(
      `localhost:${adminPort}`,
    );
    expect(server("donor", fresh).env?.OPERATIONS_NAMES).toBeUndefined();
    expect(server("missionary", fresh).env?.OPERATIONS_NAMES).toBeUndefined();
  });

  it("R1: keeps the admin server's log, which can hold forwarded browser output, outside every path a workflow uploads", () => {
    const log = adminServerLogFile({} as NodeJS.ProcessEnv);
    expect(log).toBe(".e2e-logs/auth-mail-admin-server.log");
    const uploads: string[] = [];
    for (const file of readdirSync(".github/workflows").filter((name) =>
      /\.ya?ml$/.test(name),
    )) {
      const document = loadWorkflowDocument(`.github/workflows/${file}`) as {
        jobs?: Record<string, { steps?: WorkflowStep[] }>;
      };
      for (const job of Object.values(document.jobs ?? {})) {
        for (const step of job.steps ?? []) {
          if (!String(step.uses ?? "").startsWith("actions/upload-artifact"))
            continue;
          for (const line of String(step.with?.path ?? "").split(/\r?\n/)) {
            const entry = line.trim();
            if (entry && !entry.startsWith("!")) uploads.push(entry);
          }
        }
      }
    }
    expect(uploads).toContain("test-results/auth-mail/");
    for (const entry of uploads) {
      if (entry.startsWith("${{ runner.temp }}/")) continue;
      const prefix = entry.replace(/[*?[{$].*$/, "");
      expect(prefix, entry).not.toBe("");
      expect(log.startsWith(prefix), entry).toBe(false);
    }
  });

  it("mirrors Mission Control's server output to the log file the journey reads, and starts it the same way", () => {
    const { command, env } = server("admin");
    expect(command).toContain(
      "node scripts/e2e/tee-dev-server.mjs bun run --cwd apps/admin dev:playwright",
    );
    expect(command).toMatch(/--hostname localhost$/);
    expect(env?.AUTH_MAIL_ADMIN_LOG_FILE).toBe(
      process.env.AUTH_MAIL_ADMIN_LOG_FILE?.trim() ||
        ".e2e-logs/auth-mail-admin-server.log",
    );
    for (const app of ["donor", "missionary"]) {
      expect(server(app).command).not.toContain("tee-dev-server");
    }
  });
});
