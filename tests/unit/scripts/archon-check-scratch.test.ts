import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { scratchTargets } from "../../../scripts/archon-factory/pack/.shared/round.mjs";

// A read-only role checks a candidate whose node_modules is mounted
// read-only. Tools started by the candidate's own tests (a child Vitest
// writes node_modules/.vite-temp) then fail for a reason that is not the
// candidate's. The trusted side gives those cache directories, and only
// those, a private scratch mount (the executor side is covered in
// archon-check-executor.test.ts).

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("scratch directories for read-only checks", () => {
  it("creates the cache directories of every dependency mount and names them", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-scratch-"));
    roots.push(root);
    const repo = path.join(root, "repo").replaceAll("\\", "/");
    mkdirSync(`${repo}/node_modules`, { recursive: true });
    mkdirSync(`${repo}/apps/admin/node_modules`, { recursive: true });
    expect(scratchTargets(repo, "/candidate").sort()).toEqual([
      "/candidate/apps/admin/node_modules/.vite-temp",
      "/candidate/node_modules/.cache",
      "/candidate/node_modules/.vite",
      "/candidate/node_modules/.vite-temp",
    ]);
    expect(existsSync(`${repo}/node_modules/.vite-temp`)).toBe(true);
    expect(existsSync(`${repo}/apps/admin/node_modules/.vite-temp`)).toBe(true);
    expect(existsSync(`${repo}/apps/admin/node_modules/.cache`)).toBe(false);
  });

  it("names nothing for a clone without dependencies", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-scratch-"));
    roots.push(root);
    expect(scratchTargets(root.replaceAll("\\", "/"), "/candidate")).toEqual(
      [],
    );
  });
});
