import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { linkRootEnvToApps } from "../../../scripts/sync-root-env-to-apps.mjs";

const tmpRoots: string[] = [];

function makeRepoRoot() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sync-root-env-"));
  tmpRoots.push(repoRoot);
  fs.writeFileSync(path.join(repoRoot, ".env.local"), "EXAMPLE=1\n");
  return repoRoot;
}

afterEach(() => {
  for (const repoRoot of tmpRoots.splice(0)) {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

describe("linkRootEnvToApps", () => {
  it("creates app-local symlinks to the repo-root env file", () => {
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
    expect(fs.lstatSync(dest).isSymbolicLink()).toBe(true);
    expect(path.resolve(path.dirname(dest), fs.readlinkSync(dest))).toBe(
      path.join(repoRoot, ".env.local"),
    );
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
    expect(fs.lstatSync(dest).isSymbolicLink()).toBe(true);
  });
});
