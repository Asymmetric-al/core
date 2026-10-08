import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { repairFilePackageLinks } from "../../../scripts/repair-file-package-links.mjs";

let root: string;
let installed: string;
let target: string;

function json(file: string, value: unknown) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value));
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "core-file-package-repair-"));
  installed = path.join(root, "node_modules/local-wrapper");
  target = path.join(root, "node_modules/editor-compat");
  json(path.join(root, "package.json"), {
    dependencies: {
      "local-wrapper": "file:vendor/local-wrapper",
      "editor-compat": "npm:@example/editor@1.1.1",
    },
  });
  const wrapper = {
    name: "local-wrapper",
    dependencies: { "@example/editor": "1.1.1" },
  };
  json(path.join(root, "vendor/local-wrapper/package.json"), wrapper);
  json(path.join(installed, "package.json"), wrapper);
  json(path.join(target, "package.json"), {
    name: "@example/editor",
    version: "1.1.1",
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(root, { recursive: true, force: true });
});

describe("installed file-package dependency repair", () => {
  it("links the declared exact alias within installed modules and leaves source untouched", () => {
    const source = path.join(root, "vendor/local-wrapper/package.json");
    const before = readFileSync(source);
    const result = repairFilePackageLinks(root);
    const child = path.join(installed, "node_modules/@example/editor");
    expect(result.repaired).toEqual(["local-wrapper -> @example/editor@1.1.1"]);
    expect(realpathSync(child)).toBe(realpathSync(target));
    expect(readFileSync(source)).toEqual(before);
    expect(
      existsSync(path.join(root, "vendor/local-wrapper/node_modules")),
    ).toBe(false);
    expect(repairFilePackageLinks(root).repaired).toEqual([]);
  });

  it("replaces a wrong installed child link without changing its target", () => {
    const wrong = path.join(root, "node_modules/editor-new");
    json(path.join(wrong, "package.json"), {
      name: "@example/editor",
      version: "1.5.3",
    });
    const child = path.join(installed, "node_modules/@example/editor");
    mkdirSync(path.dirname(child), { recursive: true });
    symlinkSync(
      wrong,
      child,
      process.platform === "win32" ? "junction" : "dir",
    );
    expect(repairFilePackageLinks(root).repaired).toHaveLength(1);
    expect(realpathSync(child)).toBe(realpathSync(target));
    expect(
      JSON.parse(readFileSync(path.join(wrong, "package.json"), "utf8"))
        .version,
    ).toBe("1.5.3");
  });

  it("refuses to write when the installed wrapper links to the vendor source", () => {
    rmSync(installed, { recursive: true });
    symlinkSync(
      path.join(root, "vendor/local-wrapper"),
      installed,
      process.platform === "win32" ? "junction" : "dir",
    );
    expect(() => repairFilePackageLinks(root)).toThrow(/outside.*node_modules/);
    expect(
      existsSync(path.join(root, "vendor/local-wrapper/node_modules")),
    ).toBe(false);
  });

  it("fails if the selected alias has the wrong package identity or version", () => {
    json(path.join(target, "package.json"), {
      name: "@example/editor",
      version: "1.5.3",
    });
    expect(() => repairFilePackageLinks(root)).toThrow(/alias.*1\.1\.1/);
    expect(existsSync(path.join(installed, "node_modules"))).toBe(false);
  });

  it("does not repair a declared version range using an exact alias", () => {
    const source = path.join(root, "vendor/local-wrapper/package.json");
    const wrapper = {
      name: "local-wrapper",
      dependencies: { "@example/editor": "^1.1.1" },
    };
    json(source, wrapper);
    json(path.join(installed, "package.json"), wrapper);
    expect(repairFilePackageLinks(root).repaired).toEqual([]);
  });

  it("refuses to replace an unexpected real child directory", () => {
    const child = path.join(installed, "node_modules/@example/editor");
    json(path.join(child, "package.json"), {
      name: "@example/editor",
      version: "1.5.3",
    });
    expect(() => repairFilePackageLinks(root)).toThrow(/real directory/);
    expect(lstatSync(child).isDirectory()).toBe(true);
  });

  it("rejects stale installed declarations before creating dependency links", () => {
    json(path.join(installed, "package.json"), {
      name: "local-wrapper",
      dependencies: { "@example/editor": "1.5.3" },
    });
    expect(() => repairFilePackageLinks(root)).toThrow(/declaration drift/);
    expect(existsSync(path.join(installed, "node_modules"))).toBe(false);
  });

  it("restores the original child link if replacing it fails", () => {
    const wrong = path.join(root, "node_modules/editor-new");
    json(path.join(wrong, "package.json"), {
      name: "@example/editor",
      version: "1.5.3",
    });
    const child = path.join(installed, "node_modules/@example/editor");
    mkdirSync(path.dirname(child), { recursive: true });
    symlinkSync(
      wrong,
      child,
      process.platform === "win32" ? "junction" : "dir",
    );
    const rename = fs.renameSync;
    let calls = 0;
    vi.spyOn(fs, "renameSync").mockImplementation((from, to) => {
      if (++calls === 2) throw new Error("replacement failed");
      return rename(from, to);
    });
    expect(() => repairFilePackageLinks(root)).toThrow("replacement failed");
    expect(realpathSync(child)).toBe(realpathSync(wrong));
  });
});
