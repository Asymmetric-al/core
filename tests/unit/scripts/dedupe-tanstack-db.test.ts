import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dedupeTanstackDb } from "../../../scripts/dedupe-tanstack-db.mjs";

describe("dedupeTanstackDb", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  afterEach(() => {
    warnSpy.mockClear();
  });

  it("warns and skips when canonical @tanstack/db is missing", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dedupe-db-"));
    try {
      dedupeTanstackDb(tmp, fs);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[dedupe-tanstack-db]"),
        expect.stringContaining("node_modules/@tanstack/db"),
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("replaces a nested real directory with a symlink to canonical", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dedupe-db-"));
    try {
      const canonical = path.join(tmp, "node_modules/@tanstack/db");
      const nested = path.join(
        tmp,
        "node_modules/@tanstack/react-db/node_modules/@tanstack/db",
      );
      fs.mkdirSync(path.join(canonical, "dist"), { recursive: true });
      fs.writeFileSync(path.join(canonical, "package.json"), "{}");
      fs.mkdirSync(path.join(nested, "stale"), { recursive: true });
      fs.writeFileSync(path.join(nested, "stale/x.txt"), "old");

      dedupeTanstackDb(tmp, fs);

      expect(fs.lstatSync(nested).isSymbolicLink()).toBe(true);
      expect(fs.realpathSync(nested)).toBe(fs.realpathSync(canonical));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("is idempotent when symlink already targets canonical", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dedupe-db-"));
    try {
      const canonical = path.join(tmp, "node_modules/@tanstack/db");
      const nested = path.join(
        tmp,
        "node_modules/@tanstack/react-db/node_modules/@tanstack/db",
      );
      fs.mkdirSync(canonical, { recursive: true });
      fs.writeFileSync(path.join(canonical, "package.json"), "{}");

      dedupeTanstackDb(tmp, fs);
      dedupeTanstackDb(tmp, fs);

      expect(fs.lstatSync(nested).isSymbolicLink()).toBe(true);
      expect(fs.realpathSync(nested)).toBe(fs.realpathSync(canonical));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
