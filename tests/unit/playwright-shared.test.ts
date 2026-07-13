import { describe, expect, it } from "vitest";

import {
  ADMIN_SURFACE,
  DONOR_SURFACE,
  MISSIONARY_SURFACE,
  defineBoneyardConfig,
  devServerCommand,
  getWorkerCount,
  normalizeLocalBaseUrl,
  resolveSurfaceBaseUrl,
  shouldReuseExistingServer,
} from "../../tests/e2e/playwright-shared";

type WebServerEntry = {
  command: string;
  url?: string;
  env?: Record<string, string>;
  reuseExistingServer?: boolean;
};

function singleWebServer(
  config: ReturnType<typeof defineBoneyardConfig>,
): WebServerEntry | undefined {
  return config.webServer as WebServerEntry | undefined;
}

describe("normalizeLocalBaseUrl", () => {
  it("maps loopback hostnames onto localhost with the URL port", () => {
    expect(normalizeLocalBaseUrl("http://127.0.0.1:5555", 3000)).toBe(
      "http://localhost:5555",
    );
    expect(normalizeLocalBaseUrl("http://[::1]:5555", 3000)).toBe(
      "http://localhost:5555",
    );
  });

  it("applies the default port when the local URL has none", () => {
    expect(normalizeLocalBaseUrl("http://localhost", 4000)).toBe(
      "http://localhost:4000",
    );
  });

  it("passes remote URLs through untouched", () => {
    expect(normalizeLocalBaseUrl("https://donor-preview.vercel.app", 3000)).toBe(
      "https://donor-preview.vercel.app",
    );
  });

  it("falls back to the default for invalid URLs", () => {
    expect(normalizeLocalBaseUrl("not-a-url", 3030)).toBe(
      "http://localhost:3030",
    );
  });
});

describe("getWorkerCount", () => {
  it("prefers a positive PLAYWRIGHT_WORKERS override", () => {
    expect(getWorkerCount({ PLAYWRIGHT_WORKERS: "4" })).toBe(4);
  });

  it("ignores non-positive overrides", () => {
    expect(getWorkerCount({ PLAYWRIGHT_WORKERS: "0" })).toBe(1);
    expect(getWorkerCount({ PLAYWRIGHT_WORKERS: "nope" })).toBe(1);
  });

  it("uses one worker in CI and locally by default", () => {
    expect(getWorkerCount({ CI: "1" })).toBe(1);
    expect(getWorkerCount({})).toBe(1);
  });
});

describe("shouldReuseExistingServer", () => {
  it("defaults to reusing an existing server outside CI", () => {
    expect(shouldReuseExistingServer({})).toBe(true);
  });

  it("defaults to starting a fresh server in CI", () => {
    expect(shouldReuseExistingServer({ CI: "1" })).toBe(false);
  });

  it("allows CI to reuse a manually started server", () => {
    expect(
      shouldReuseExistingServer({
        CI: "1",
        PLAYWRIGHT_REUSE_EXISTING_SERVER: "1",
      }),
    ).toBe(true);
  });

  it("allows an explicit false value to override local reuse", () => {
    expect(
      shouldReuseExistingServer({
        PLAYWRIGHT_REUSE_EXISTING_SERVER: "false",
      }),
    ).toBe(false);
  });
});

describe("resolveSurfaceBaseUrl", () => {
  it("uses the surface default when nothing is configured", () => {
    expect(resolveSurfaceBaseUrl(ADMIN_SURFACE, {})).toBe(
      "http://localhost:3030",
    );
    expect(resolveSurfaceBaseUrl(DONOR_SURFACE, {})).toBe(
      "http://localhost:3000",
    );
    expect(resolveSurfaceBaseUrl(MISSIONARY_SURFACE, {})).toBe(
      "http://localhost:4000",
    );
  });

  it("honours env precedence: PLAYWRIGHT_* over QA_*", () => {
    expect(
      resolveSurfaceBaseUrl(ADMIN_SURFACE, {
        PLAYWRIGHT_ADMIN_BASE_URL: "https://admin-explicit.vercel.app",
        QA_ADMIN_BASE_URL: "https://admin-preview.vercel.app",
      }),
    ).toBe("https://admin-explicit.vercel.app");
  });
});

describe("defineBoneyardConfig", () => {
  it("builds each surface's project and baseURL", () => {
    for (const [surface, projectName, baseURL] of [
      [ADMIN_SURFACE, "admin-boneyard", "http://localhost:3030"],
      [DONOR_SURFACE, "donor-boneyard", "http://localhost:3000"],
      [MISSIONARY_SURFACE, "missionary-boneyard", "http://localhost:4000"],
    ] as const) {
      const config = defineBoneyardConfig(surface, {});
      expect(config.projects?.map((project) => project.name)).toEqual([
        projectName,
      ]);
      expect(config.use?.baseURL).toBe(baseURL);
    }
  });

  it("starts the surface dev server against a local base URL", () => {
    const config = defineBoneyardConfig(ADMIN_SURFACE, {});
    const webServer = singleWebServer(config);
    expect(webServer?.command).toContain("apps/admin");
    expect(webServer?.command).toContain("--port 3030");
    expect(webServer?.command).toContain("--hostname localhost");
    expect(webServer?.url).toBe("http://localhost:3030");
  });

  it("defaults E2E_AUTH_BYPASS on for every surface dev server", () => {
    for (const surface of [ADMIN_SURFACE, DONOR_SURFACE, MISSIONARY_SURFACE]) {
      const config = defineBoneyardConfig(surface, {});
      expect(singleWebServer(config)?.env?.E2E_AUTH_BYPASS).toBe("true");
    }
  });

  it("keeps an explicit E2E_AUTH_BYPASS value", () => {
    const config = defineBoneyardConfig(ADMIN_SURFACE, {
      E2E_AUTH_BYPASS: "false",
    });
    expect(singleWebServer(config)?.env?.E2E_AUTH_BYPASS).toBe("false");
  });

  it("omits the web server for remote base URLs", () => {
    const config = defineBoneyardConfig(ADMIN_SURFACE, {
      PLAYWRIGHT_ADMIN_BASE_URL: "https://admin-preview.vercel.app",
    });
    expect(config.webServer).toBeUndefined();
  });

  it("donor surface hands server ownership to the caller when a base URL is configured", () => {
    const config = defineBoneyardConfig(DONOR_SURFACE, {
      PLAYWRIGHT_DONOR_BASE_URL: "http://localhost:3000",
    });
    expect(config.webServer).toBeUndefined();
  });

  it("admin surface still manages the server for a configured local base URL", () => {
    const config = defineBoneyardConfig(ADMIN_SURFACE, {
      PLAYWRIGHT_ADMIN_BASE_URL: "http://localhost:3030",
    });
    expect(singleWebServer(config)).toBeDefined();
  });

  it("applies the admin first-compile timeout only where declared", () => {
    expect(defineBoneyardConfig(ADMIN_SURFACE, {}).timeout).toBe(180_000);
    expect(defineBoneyardConfig(DONOR_SURFACE, {}).timeout).toBeUndefined();
  });

  it("reuse policy is env-aware on every surface", () => {
    const ciReuse = defineBoneyardConfig(DONOR_SURFACE, {
      CI: "1",
      PLAYWRIGHT_REUSE_EXISTING_SERVER: "1",
    });
    expect(singleWebServer(ciReuse)?.reuseExistingServer).toBe(true);
  });
});

describe("devServerCommand", () => {
  it("clears the stale Next dev lock before starting the app", () => {
    const command = devServerCommand("missionary", 4000, "localhost");
    expect(command).toContain("apps/missionary/.next/dev/lock");
    expect(command).toContain("bun run --cwd apps/missionary dev:playwright");
    expect(command).toContain("--port 4000");
  });
});
