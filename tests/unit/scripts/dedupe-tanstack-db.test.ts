import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { dedupeTanstackDb } from "../../../scripts/dedupe-tanstack-db.mjs";

const symlinkTestsSupported = (() => {
  if (process.platform !== "win32") return true;
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), "dedupe-db-symlink-probe-"),
  );
  const target = path.join(dir, "t");
  const link = path.join(dir, "l");
  try {
    fs.mkdirSync(target);
    fs.symlinkSync(target, link, "dir");
    return true;
  } catch {
    return false;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
})();

describe("dedupeTanstackDb", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  afterEach(() => {
    warnSpy.mockClear();
  });

  it("warns and skips when canonical @tanstack/db is missing", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dedupe-db-"));
    try {
      dedupeTanstackDb(tmp, fs);
      expect(warnSpy).toHaveBeenCalled();
      expect(
        warnSpy.mock.calls.some(
          (args) =>
            typeof args[0] === "string" &&
            args[0].includes("[dedupe-tanstack-db]") &&
            typeof args[1] === "string" &&
            args[1].replace(/\\/g, "/").includes("node_modules/@tanstack/db"),
        ),
      ).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it.skipIf(!symlinkTestsSupported)(
    "replaces a nested real directory with a symlink to canonical",
    () => {
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
    },
  );

  it.skipIf(!symlinkTestsSupported)(
    "is idempotent when symlink already targets canonical",
    () => {
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
    },
  );

  it("warns and continues when the platform disallows symlink creation", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dedupe-db-"));
    try {
      const canonical = path.join(tmp, "node_modules/@tanstack/db");
      fs.mkdirSync(canonical, { recursive: true });
      fs.writeFileSync(path.join(canonical, "package.json"), "{}");

      const mockFs = {
        ...fs,
        symlinkSync: vi.fn(() => {
          const err = new Error(
            "symlink not permitted",
          ) as NodeJS.ErrnoException;
          err.code = "EPERM";
          throw err;
        }),
      } as typeof fs;

      expect(() => dedupeTanstackDb(tmp, mockFs)).not.toThrow();
      expect(
        warnSpy.mock.calls.some(
          ([message]) =>
            typeof message === "string" &&
            message.includes("[dedupe-tanstack-db] Skipping symlink"),
        ),
      ).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
