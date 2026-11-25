import { afterEach, describe, expect, it, vi } from "vitest";

const SEED = "00000000-0000-0000-0000-000000000001";
const OWN = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";
const KEYS = [
  "ASYM_USE_CI_ENV_DEFAULTS",
  "E2E_AUTH_BYPASS",
  "E2E_AUTH_TENANT_ID",
  "PLAYWRIGHT_BASE_URL",
  "QA_DONOR_BASE_URL",
  "PLAYWRIGHT_INCLUDE_ADMIN",
  "CMS_LOCAL_STRICT",
] as const;
const original = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
  vi.resetModules();
});

type Server = { command: string; env: Record<string, string | undefined> };

async function serversFor(env: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) delete process.env[key];
  Object.assign(process.env, env);
  vi.resetModules();
  const config = (await import("../../playwright.config")).default;
  const webServer = config.webServer as Server | Server[] | undefined;
  return webServer ? ([] as Server[]).concat(webServer) : [];
}

describe("playwright.config.ts sets E2E_AUTH_TENANT_ID wherever it turns the bypass on (AL-2676)", () => {
  it("defaults every server to the seed's organization under the CI defaults", async () => {
    const servers = await serversFor({ ASYM_USE_CI_ENV_DEFAULTS: "1" });
    expect(servers.length).toBeGreaterThanOrEqual(2);
    for (const server of servers) {
      expect(server.env.E2E_AUTH_BYPASS, server.command).toBe("true");
      expect(server.env.E2E_AUTH_TENANT_ID, server.command).toBe(SEED);
    }
  });

  it("keeps an E2E_AUTH_TENANT_ID the caller set, on every server", async () => {
    const servers = await serversFor({
      ASYM_USE_CI_ENV_DEFAULTS: "1",
      E2E_AUTH_TENANT_ID: OWN,
    });
    for (const server of servers) {
      expect(server.env.E2E_AUTH_TENANT_ID, server.command).toBe(OWN);
    }
  });

  it("defaults the donor server, which turns the bypass on without the CI defaults", async () => {
    const [donor] = await serversFor({ PLAYWRIGHT_INCLUDE_ADMIN: "0" });
    expect(donor?.command).toContain("apps/donor");
    expect(donor?.env.E2E_AUTH_BYPASS).toBe("true");
    expect(donor?.env.E2E_AUTH_TENANT_ID).toBe(SEED);
  });
});
