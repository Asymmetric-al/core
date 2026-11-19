import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  checkDevServerLock,
  devServerConflictMessage,
  devServerLockPath,
  readDevServerLock,
  runningDevServer,
} from "../../tests/e2e/dev-server-lock.mjs";
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
    expect(
      normalizeLocalBaseUrl("https://donor-preview.vercel.app", 3000),
    ).toBe("https://donor-preview.vercel.app");
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
  // Next.js 16.4 holds .next/dev/lock as an operating-system lock that is
  // released when its process dies, so a crashed run cannot block the next
  // start; deleting it only lets a second server start over a live one.
  it("starts the app without deleting a running dev server's lock", () => {
    for (const env of [{ CI: "true" }, {}]) {
      const command = devServerCommand("missionary", 4000, "localhost", env);
      expect(command).not.toContain(".next/dev/lock");
      expect(command).not.toContain("rmSync");
    }
  });

  it("leaves the CI command exactly as it was", () => {
    expect(
      devServerCommand("missionary", 4000, "localhost", { CI: "true" }),
    ).toBe(
      "bun run --cwd apps/missionary dev:playwright -- --port 4000 --hostname localhost",
    );
  });

  // Review round 6 (c2.5): locally, a next dev already running for the same
  // app holds its lock, and the second server would exit with a generic
  // error. The check names that server first.
  it("checks for a running dev server first when run locally", () => {
    expect(devServerCommand("missionary", 4000, "localhost", {})).toBe(
      "node tests/e2e/dev-server-lock.mjs missionary 4000 localhost && bun run --cwd apps/missionary dev:playwright -- --port 4000 --hostname localhost",
    );
  });

  it("passes the boneyard environment through to the command", () => {
    const local = singleWebServer(defineBoneyardConfig(MISSIONARY_SURFACE, {}));
    expect(local?.command).toMatch(/^node tests\/e2e\/dev-server-lock\.mjs /);
    const ci = singleWebServer(
      defineBoneyardConfig(MISSIONARY_SURFACE, { CI: "true" }),
    );
    expect(ci?.command).toMatch(/^bun run --cwd apps\/missionary /);
  });
});

describe("the running dev-server check", () => {
  const roots: string[] = [];
  afterEach(() => {
    for (const root of roots.splice(0))
      rmSync(root, { recursive: true, force: true });
  });
  function rootWithLock(app: string, content: string | undefined) {
    const root = mkdtempSync(path.join(os.tmpdir(), "dev-server-lock-"));
    roots.push(root);
    if (content !== undefined) {
      const lock = devServerLockPath(app, root);
      mkdirSync(path.dirname(lock), { recursive: true });
      writeFileSync(lock, content);
    }
    return root;
  }
  const server = {
    pid: 4242,
    port: 3000,
    hostname: "localhost",
    appUrl: "http://localhost:3000",
    startedAt: 1,
  };

  it("reads the server Next.js records in its lock", () => {
    const root = rootWithLock("donor", JSON.stringify(server));
    expect(readDevServerLock(devServerLockPath("donor", root))).toEqual(server);
  });

  it.each([
    ["no lock", undefined],
    ["an empty lock", ""],
    ["a lock that is not JSON", "locked"],
    ["a lock without a pid", JSON.stringify({ port: 3000 })],
  ])("reads nothing from %s", (_label, content) => {
    const root = rootWithLock("donor", content);
    expect(readDevServerLock(devServerLockPath("donor", root))).toBeNull();
  });

  it.each([
    ["a live server that is listening", true, true, true],
    ["a dead process (a stale lock)", false, true, false],
    ["a live process that is not listening", true, false, false],
  ])("reports %s", async (_label, alive, listening, reported) => {
    const root = rootWithLock("donor", JSON.stringify(server));
    const found = await runningDevServer({
      app: "donor",
      root,
      isAlive: () => alive,
      isListening: async () => listening,
    });
    expect(found).toEqual(reported ? server : null);
  });

  it("names the running server and what to do", () => {
    const message = devServerConflictMessage({
      app: "donor",
      port: 3005,
      hostname: "127.0.0.1",
      server,
      platform: "win32",
    });
    expect(message).toContain("apps/donor");
    expect(message).toContain("http://localhost:3000");
    expect(message).toContain("PID 4242");
    expect(message).toContain("taskkill /PID 4242 /T /F");
    expect(message).toContain("apps/donor/.next/dev/lock");
    expect(message).toContain("--port 3005 --hostname 127.0.0.1");
    expect(
      devServerConflictMessage({
        app: "donor",
        port: 3005,
        hostname: "127.0.0.1",
        server,
        platform: "linux",
      }),
    ).toContain("kill 4242");
  });

  it("fails with the message when a server holds the lock, and passes otherwise", async () => {
    const root = rootWithLock("donor", JSON.stringify(server));
    const errors: string[] = [];
    const options = {
      root,
      isAlive: () => true,
      isListening: async () => true,
      error: (line: string) => errors.push(line),
    };
    expect(
      await checkDevServerLock(["donor", "3005", "127.0.0.1"], options),
    ).toBe(1);
    expect(errors.join("\n")).toContain("PID 4242");
    expect(
      await checkDevServerLock(["missionary", "4000", "localhost"], options),
    ).toBe(0);
  });

  it("lets the start go ahead from the command line when no server holds the lock", () => {
    const result = spawnSync(
      process.execPath,
      ["tests/e2e/dev-server-lock.mjs", "no-such-app", "4000", "localhost"],
      { encoding: "utf8", shell: false },
    );
    expect(result.status, result.stderr).toBe(0);
  });
});
