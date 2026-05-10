import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { linkRootEnvToApps } from "../../../scripts/sync-root-env-to-apps.mjs";

const tmpRoots: string[] = [];

function makeRepoRoot() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sync-root-env-"));
  tmpRoots.push(repoRoot);
  fs.writeFileSync(path.join(repoRoot, ".env.local"), "EXAMPLE=1\n");
  return repoRoot;
}

function expectLinkedToRootEnv(dest: string, source: string) {
  const stat = fs.lstatSync(dest);

  if (stat.isSymbolicLink()) {
    expect(path.resolve(path.dirname(dest), fs.readlinkSync(dest))).toBe(
      source,
    );
    return;
  }

  const sourceStat = fs.statSync(source);
  const destStat = fs.statSync(dest);
  expect(destStat.dev).toBe(sourceStat.dev);
  expect(destStat.ino).toBe(sourceStat.ino);
  expect(fs.readFileSync(dest, "utf8")).toBe(fs.readFileSync(source, "utf8"));
}

afterEach(() => {
  vi.restoreAllMocks();

  for (const repoRoot of tmpRoots.splice(0)) {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

describe("linkRootEnvToApps", () => {
  it("creates app-local links to the repo-root env file", () => {
    const repoRoot = makeRepoRoot();

    const results = linkRootEnvToApps(repoRoot, { apps: ["donor"] });
    const dest = path.join(repoRoot, "apps", "donor", ".env.local");

    expect(results).toEqual([
      {
        app: "donor",
        dest,
        source: path.join(repoRoot, ".env.local"),
        status: "linked",
      },
    ]);
    expectLinkedToRootEnv(dest, path.join(repoRoot, ".env.local"));
  });

  it("refuses to overwrite an app-local env file by default", () => {
    const repoRoot = makeRepoRoot();
    const dest = path.join(repoRoot, "apps", "admin", ".env.local");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, "APP_ONLY=1\n");

    const results = linkRootEnvToApps(repoRoot, { apps: ["admin"] });

    expect(results[0]).toMatchObject({
      app: "admin",
      dest,
      source: path.join(repoRoot, ".env.local"),
      status: "refused",
    });
    expect(fs.readFileSync(dest, "utf8")).toBe("APP_ONLY=1\n");
  });

  it("replaces an app-local env file only when forced", () => {
    const repoRoot = makeRepoRoot();
    const dest = path.join(repoRoot, "apps", "missionary", ".env.local");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, "APP_ONLY=1\n");

    const results = linkRootEnvToApps(repoRoot, {
      apps: ["missionary"],
      force: true,
    });

    expect(results[0]).toMatchObject({
      app: "missionary",
      dest,
      source: path.join(repoRoot, ".env.local"),
      status: "relinked",
    });
    expectLinkedToRootEnv(dest, path.join(repoRoot, ".env.local"));
  });

  it.skipIf(process.platform !== "win32")(
    "falls back to a hard link when Windows blocks file symlink creation",
    () => {
      const repoRoot = makeRepoRoot();
      const source = path.join(repoRoot, ".env.local");
      const dest = path.join(repoRoot, "apps", "donor", ".env.local");
      const symlinkError = new Error(
        "symlink not permitted",
      ) as NodeJS.ErrnoException;
      symlinkError.code = "EPERM";
      const symlinkSync = vi.spyOn(fs, "symlinkSync").mockImplementation(() => {
        throw symlinkError;
      });

      const results = linkRootEnvToApps(repoRoot, { apps: ["donor"] });

      expect(results).toEqual([
        {
          app: "donor",
          dest,
          source,
          status: "linked",
        },
      ]);
      expect(symlinkSync).toHaveBeenCalledWith(
        path.relative(path.dirname(dest), source),
        dest,
      );
      expect(fs.lstatSync(dest).isSymbolicLink()).toBe(false);
      expectLinkedToRootEnv(dest, source);
    },
  );

  it("treats an existing hard link to the root env file as unchanged", () => {
    const repoRoot = makeRepoRoot();
    const source = path.join(repoRoot, ".env.local");
    const dest = path.join(repoRoot, "apps", "admin", ".env.local");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.linkSync(source, dest);

    const results = linkRootEnvToApps(repoRoot, { apps: ["admin"] });

    expect(results).toEqual([
      {
        app: "admin",
        dest,
        source,
        status: "unchanged",
      },
    ]);
    expectLinkedToRootEnv(dest, source);
  });
});
