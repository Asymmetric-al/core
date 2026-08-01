import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  lstatSync,
  realpathSync,
  existsSync,
  renameSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { repairWorkspaceLinks } from "../../../scripts/repair-workspace-links.mjs";

let repoRoot: string;

function writeJson(filePath: string, value: unknown) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2));
}

beforeEach(() => {
  repoRoot = mkdtempSync(path.join(tmpdir(), "repair-links-"));
  writeJson(path.join(repoRoot, "package.json"), {
    name: "fixture-root",
    workspaces: ["apps/*", "packages/*"],
  });
  writeJson(path.join(repoRoot, "packages/mock-data/package.json"), {
    name: "@asym/mock-data",
  });
  writeJson(path.join(repoRoot, "apps/admin/package.json"), {
    name: "@asym/admin",
    dependencies: { "@asym/mock-data": "workspace:*" },
  });
});

afterEach(() => {
  rmSync(repoRoot, { recursive: true, force: true });
});

describe("repairWorkspaceLinks", () => {
  it("replaces a hollow directory (no package.json) with a link to the workspace package", () => {
    const hollow = path.join(
      repoRoot,
      "apps/admin/node_modules/@asym/mock-data",
    );
    mkdirSync(path.join(hollow, "dist"), { recursive: true });
    writeFileSync(path.join(hollow, "dist/tsconfig.tsbuildinfo"), "{}");

    const { repaired } = repairWorkspaceLinks(repoRoot);

    expect(repaired).toHaveLength(1);
    expect(lstatSync(hollow).isSymbolicLink()).toBe(true);
    expect(realpathSync(hollow)).toBe(
      realpathSync(path.join(repoRoot, "packages/mock-data")),
    );
  });

  it("leaves a healthy link untouched", () => {
    const linkPath = path.join(
      repoRoot,
      "apps/admin/node_modules/@asym/mock-data",
    );
    mkdirSync(path.dirname(linkPath), { recursive: true });
    symlinkSync(
      path.join(repoRoot, "packages/mock-data"),
      linkPath,
      process.platform === "win32" ? "junction" : "dir",
    );

    const { repaired } = repairWorkspaceLinks(repoRoot);

    expect(repaired).toHaveLength(0);
  });

  it("leaves a real directory that has a package.json untouched", () => {
    const materialized = path.join(
      repoRoot,
      "apps/admin/node_modules/@asym/mock-data",
    );
    writeJson(path.join(materialized, "package.json"), {
      name: "@asym/mock-data",
    });

    const { repaired } = repairWorkspaceLinks(repoRoot);

    expect(repaired).toHaveLength(0);
    expect(lstatSync(materialized).isSymbolicLink()).toBe(false);
  });

  it("does not create links Bun omitted entirely", () => {
    mkdirSync(path.join(repoRoot, "apps/admin/node_modules"), {
      recursive: true,
    });

    const { repaired } = repairWorkspaceLinks(repoRoot);

    expect(repaired).toHaveLength(0);
    expect(
      existsSync(path.join(repoRoot, "apps/admin/node_modules/@asym")),
    ).toBe(false);
  });

  it("skips a locked entry instead of failing the install", () => {
    // This runs from postinstall, and the rename is the first mutating step.
    // An EBUSY there (concurrent install, or a process holding the directory)
    // must not take down `bun install` itself.
    const hollow = path.join(
      repoRoot,
      "apps/admin/node_modules/@asym/mock-data",
    );
    const hollowBuildInfo = path.join(hollow, "dist/tsconfig.tsbuildinfo");
    mkdirSync(path.dirname(hollowBuildInfo), { recursive: true });
    writeFileSync(hollowBuildInfo, "{}");

    const { repaired } = repairWorkspaceLinks(repoRoot, {
      existsSync,
      lstatSync,
      mkdirSync,
      readFileSync,
      readdirSync,
      renameSync() {
        const error = new Error("resource busy or locked");
        (error as NodeJS.ErrnoException).code = "EBUSY";
        throw error;
      },
      rmSync,
      symlinkSync,
    });

    expect(repaired).toHaveLength(0);
    // Untouched, not half-repaired.
    expect(existsSync(hollowBuildInfo)).toBe(true);
  });

  it("recovers an interrupted repair backup before recreating the link", () => {
    const linkPath = path.join(
      repoRoot,
      "apps/admin/node_modules/@asym/mock-data",
    );
    const backupPath = `${linkPath}.repair-backup-12345-0`;
    mkdirSync(path.join(linkPath, "dist"), { recursive: true });
    writeFileSync(path.join(linkPath, "dist/tsconfig.tsbuildinfo"), "{}");
    renameSync(linkPath, backupPath);

    const { repaired } = repairWorkspaceLinks(repoRoot);

    expect(repaired).toHaveLength(1);
    expect(existsSync(backupPath)).toBe(false);
    expect(lstatSync(linkPath).isSymbolicLink()).toBe(true);
    expect(realpathSync(linkPath)).toBe(
      realpathSync(path.join(repoRoot, "packages/mock-data")),
    );
  });

  it("restores the hollow directory if symlink creation is not supported", () => {
    const hollow = path.join(
      repoRoot,
      "apps/admin/node_modules/@asym/mock-data",
    );
    const hollowBuildInfo = path.join(hollow, "dist/tsconfig.tsbuildinfo");
    mkdirSync(path.dirname(hollowBuildInfo), { recursive: true });
    writeFileSync(hollowBuildInfo, "{}");

    const { repaired } = repairWorkspaceLinks(repoRoot, {
      existsSync,
      lstatSync,
      mkdirSync,
      readFileSync,
      readdirSync,
      renameSync,
      rmSync,
      symlinkSync() {
        const error = new Error("Symlinks are disabled");
        (error as NodeJS.ErrnoException).code = "EPERM";
        throw error;
      },
    });

    expect(repaired).toHaveLength(0);
    expect(lstatSync(hollow).isDirectory()).toBe(true);
    expect(existsSync(hollowBuildInfo)).toBe(true);
  });

  it("fails fast when all generated backup paths are unavailable", () => {
    const hollow = path.join(
      repoRoot,
      "apps/admin/node_modules/@asym/mock-data",
    );
    mkdirSync(path.join(hollow, "dist"), { recursive: true });
    writeFileSync(path.join(hollow, "dist/tsconfig.tsbuildinfo"), "{}");

    expect(() =>
      repairWorkspaceLinks(repoRoot, {
        existsSync(filePath) {
          if (filePath.includes(".repair-backup-")) return true;
          return existsSync(filePath);
        },
        lstatSync,
        mkdirSync,
        readFileSync,
        readdirSync,
        renameSync,
        rmSync,
        symlinkSync,
      }),
    ).toThrow("Could not find an available backup path");
  });
});
