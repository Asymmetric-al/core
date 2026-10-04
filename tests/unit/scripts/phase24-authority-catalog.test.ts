import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";

const roots: string[] = [];
const catalog = "docs/prds/sitestacker-parity/phase-24-authority-contract.json";
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});
it("rejects duplicate JSON keys even when JSON.parse would preserve the approved value", () => {
  const root = mkdtempSync(path.join(tmpdir(), "phase24-catalog-"));
  roots.push(root);
  for (const relative of [
    "docs/prds/sitestacker-parity",
    "docs/adr",
    "docs/ai/document-authority.md",
    "openspec/changes/add-multi-site-management",
  ]) {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    cpSync(relative, path.join(root, relative), { recursive: true });
  }
  const source = readFileSync(path.join(root, catalog), "utf8");
  writeFileSync(
    path.join(root, catalog),
    source.replace(
      '"schemaVersion": 1,',
      '"schemaVersion": 1, "schemaVersion": 1,',
    ),
  );
  const result = spawnSync(
    process.execPath,
    ["scripts/verify/phase24-authority.mjs", "--root", root, "--json"],
    { encoding: "utf8" },
  );
  expect(result.status).not.toBe(0);
  expect(result.stdout).toContain("schemaVersion");
  expect(result.stdout).toContain(catalog);
});
