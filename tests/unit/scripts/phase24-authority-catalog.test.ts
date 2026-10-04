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
import { fileURLToPath } from "node:url";
import { afterEach, expect, it } from "vitest";

const roots: string[] = [];
const repository = fileURLToPath(new URL("../../../", import.meta.url));
const cli = path.join(repository, "scripts/verify/phase24-authority.mjs");
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
    cpSync(path.join(repository, relative), path.join(root, relative), {
      recursive: true,
    });
  }
  const source = readFileSync(path.join(root, catalog), "utf8");
  const duplicated = source.replace(
    '"schemaVersion": 1,',
    '"schemaVersion": 1, "schemaVersion": 1,',
  );
  expect(duplicated).not.toBe(source);
  expect(JSON.parse(duplicated)).toEqual(JSON.parse(source));
  writeFileSync(path.join(root, catalog), duplicated);
  const result = spawnSync(process.execPath, [cli, "--root", root, "--json"], {
    cwd: root,
    encoding: "utf8",
    timeout: 20_000,
    shell: false,
  });
  expect(result.error).toBeUndefined();
  expect(result.signal).toBeNull();
  expect(result.status).not.toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.outcome).toBe("invalid");
  expect(report.diagnostics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: "duplicate-json-key",
        file: catalog,
        token: "schemaVersion",
      }),
    ]),
  );
});
