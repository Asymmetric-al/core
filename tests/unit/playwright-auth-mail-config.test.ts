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
