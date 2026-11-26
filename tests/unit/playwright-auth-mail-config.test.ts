import { describe, expect, it } from "vitest";

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

function server(app: string): Server {
  const servers = (
    Array.isArray(config.webServer) ? config.webServer : [config.webServer]
  ) as Server[];
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

  it("gives only Mission Control's server an operations address, its own localhost port", () => {
    expect(server("admin").env?.OPERATIONS_NAMES).toBe(
      process.env.OPERATIONS_NAMES ?? `localhost:${adminPort}`,
    );
    if (process.env.OPERATIONS_NAMES === undefined) {
      expect(server("donor").env?.OPERATIONS_NAMES).toBeUndefined();
      expect(server("missionary").env?.OPERATIONS_NAMES).toBeUndefined();
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
        "test-results/auth-mail/admin-server.log",
    );
    for (const app of ["donor", "missionary"]) {
      expect(server(app).command).not.toContain("tee-dev-server");
    }
  });
});
