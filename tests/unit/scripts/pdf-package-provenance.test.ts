import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const script = path.resolve("scripts/verify/pdf-package-provenance.mjs");
const roots: string[] = [];
const names = [
  "docraptor-client",
  "pdf-template-schema",
  "pdf-renderer",
  "pdf-editor",
  "pdf-studio-adapter",
];
const sourceCommit = "a".repeat(40);
const reviewedCommit = "b".repeat(40);
const repository = "https://github.com/Asymmetric-al/react-PDF";
const license = readFileSync(
  "vendor/react-pdf-packages/asym-pdf-editor/LICENSE.md",
);
const recordPath = "docs/maintenance/modernization/pdf-owner-release.json";
const receiptPath =
  "docs/maintenance/modernization/pdf-package-provenance.json";
const digest = (bytes: string | Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

function write(root: string, relative: string, bytes: string | Buffer) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, bytes);
}

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "core-pdf-provenance-"));
  roots.push(root);
  const packages = names.map((name) => {
    const directory = `vendor/react-pdf-packages/asym-${name}`;
    const archive = `${directory}-0.1.0.tgz`;
    const files = {
      "package.json": Buffer.from(
        JSON.stringify({
          name: `@asym/${name}`,
          version: "0.1.0",
          license: "MIT",
          repository: {
            type: "git",
            url: `${repository}.git`,
            directory: `packages/${name}`,
          },
          exports: { ".": "./dist/index.mjs" },
          dependencies:
            name === "pdf-template-schema"
              ? { zod: "4.6.7" }
              : { "@asym/pdf-template-schema": "0.1.0" },
        }),
      ),
      "LICENSE.md": license,
      "dist/index.mjs": Buffer.from(`export const name = "${name}";\n`),
    };
    for (const [file, bytes] of Object.entries(files))
      write(root, `${directory}/${file}`, bytes);
    const archiveBytes = Buffer.from(`reviewed archive for ${name}`);
    write(root, archive, archiveBytes);
    return {
      name: `@asym/${name}`,
      version: "0.1.0",
      directory,
      archive,
      artifact: path.basename(archive),
      sha256: digest(archiveBytes),
      bytes: archiveBytes.length,
      files: Object.entries(files).map(([file, bytes]) => ({
        path: `package/${file}`,
        sha256: digest(bytes),
        bytes: bytes.length,
      })),
    };
  });
  const record = {
    schemaVersion: 1,
    sourceRepository: repository,
    sourceCommit,
    lockSha256: "c".repeat(64),
    version: "0.1.0",
    packages: packages.map(
      ({ directory: _directory, archive: _archive, ...pkg }) => pkg,
    ),
  };
  const recordBytes = JSON.stringify(record);
  write(root, recordPath, recordBytes);
  write(
    root,
    receiptPath,
    JSON.stringify({
      schemaVersion: 1,
      sourceRepository: repository,
      sourceCommit,
      sourceLockSha256: record.lockSha256,
      reviewedReleaseCommit: reviewedCommit,
      ownerMergeCommit: "d".repeat(40),
      ownerPullRequest: `${repository}/pull/25`,
      releaseRecord: {
        path: recordPath,
        url: `${repository}/blob/${reviewedCommit}/docs/maintenance/core-pdf-modernization/artifact-release.json`,
        sha256: digest(recordBytes),
      },
      version: "0.1.0",
      license: "MIT",
      packages: packages.map(
        ({ files: _files, artifact: _artifact, ...pkg }) => pkg,
      ),
    }),
  );
  const relativeScript = "scripts/verify/pdf-package-provenance.mjs";
  if (existsSync(script)) {
    mkdirSync(path.dirname(path.join(root, relativeScript)), {
      recursive: true,
    });
    copyFileSync(script, path.join(root, relativeScript));
  }
  return root;
}

type FixtureRecord = {
  packages: {
    name: string;
    files: { path: string; bytes: number; sha256: string }[];
  }[];
};

type FixtureManifest = {
  [key: string]: unknown;
  dependencies: Record<string, string>;
  exports: Record<string, string>;
};

function reviseRecord(root: string, change: (record: FixtureRecord) => void) {
  const record = JSON.parse(readFileSync(path.join(root, recordPath), "utf8"));
  change(record);
  const bytes = JSON.stringify(record);
  write(root, recordPath, bytes);
  const receipt = JSON.parse(
    readFileSync(path.join(root, receiptPath), "utf8"),
  );
  receipt.releaseRecord.sha256 = digest(bytes);
  write(root, receiptPath, JSON.stringify(receipt));
}

function reviseManifest(
  root: string,
  change: (manifest: FixtureManifest) => void,
) {
  const file = "vendor/react-pdf-packages/asym-pdf-editor/package.json";
  const manifest = JSON.parse(readFileSync(path.join(root, file), "utf8"));
  change(manifest);
  const bytes = JSON.stringify(manifest);
  write(root, file, bytes);
  reviseRecord(root, (record) => {
    const pkg = record.packages.find(
      (item: { name: string }) => item.name === "@asym/pdf-editor",
    );
    if (!pkg) throw new Error("PDF editor fixture missing");
    const entry = pkg.files.find(
      (item: { path: string }) => item.path === "package/package.json",
    );
    if (!entry) throw new Error("Package manifest fixture missing");
    entry.bytes = Buffer.byteLength(bytes);
    entry.sha256 = digest(bytes);
  });
}

function check(root: string) {
  return spawnSync(
    process.execPath,
    ["scripts/verify/pdf-package-provenance.mjs"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: "" },
    },
  );
}

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("PDF package provenance gate", () => {
  it("qualifies exactly the reviewed package bytes and archives without mutation", () => {
    const root = fixture();
    const receiptBefore = readFileSync(path.join(root, receiptPath));
    const result = check(root);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("5 packages");
    expect(readFileSync(path.join(root, receiptPath))).toEqual(receiptBefore);
  });

  it("rejects changed compiled bytes", () => {
    const root = fixture();
    write(
      root,
      "vendor/react-pdf-packages/asym-pdf-editor/dist/index.mjs",
      "changed",
    );
    const result = check(root);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/hash mismatch|byte length mismatch/);
  });

  it("rejects an edited owner release record", () => {
    const root = fixture();
    write(
      root,
      recordPath,
      `${readFileSync(path.join(root, recordPath), "utf8")} `,
    );
    expect(check(root).stderr).toContain("owner release record hash mismatch");
  });

  it("rejects a different build source even when it is a valid commit ID", () => {
    const root = fixture();
    const receipt = JSON.parse(
      readFileSync(path.join(root, receiptPath), "utf8"),
    );
    receipt.sourceCommit = "e".repeat(40);
    write(root, receiptPath, JSON.stringify(receipt));
    expect(check(root).stderr).toContain("owner source identity mismatch");
  });

  it("rejects a missing packaged file", () => {
    const root = fixture();
    rmSync(
      path.join(
        root,
        "vendor/react-pdf-packages/asym-pdf-editor/dist/index.mjs",
      ),
    );
    expect(check(root).status).not.toBe(0);
  });

  it("rejects an unexpected packaged file", () => {
    const root = fixture();
    write(
      root,
      "vendor/react-pdf-packages/asym-pdf-editor/dist/old-chunk.mjs",
      "legacy",
    );
    expect(check(root).stderr).toContain("unexpected package files");
  });

  it("rejects a retained legacy archive", () => {
    const root = fixture();
    write(
      root,
      "vendor/react-pdf-packages/asym-pdf-editor-0.0.0.tgz",
      "legacy",
    );
    expect(check(root).stderr).toContain("unexpected vendor artifacts");
  });

  it("rejects changed archive bytes", () => {
    const root = fixture();
    write(
      root,
      "vendor/react-pdf-packages/asym-pdf-editor-0.1.0.tgz",
      "changed archive",
    );
    expect(check(root).stderr).toMatch(/hash mismatch|byte length mismatch/);
  });

  it("checks file hashes even when the byte length is unchanged", () => {
    const root = fixture();
    const file = "vendor/react-pdf-packages/asym-pdf-editor/dist/index.mjs";
    const bytes = readFileSync(path.join(root, file));
    bytes[0] = bytes[0] === 88 ? 89 : 88;
    write(root, file, bytes);
    expect(check(root).stderr).toContain("hash mismatch");
  });

  it.each([
    ["name", "@asym/another-editor"],
    ["version", "0.0.0"],
    ["license", "UNLICENSED"],
    ["repository", { type: "git", url: "https://example.com/other.git" }],
  ])(
    "checks manifest %s against the approved source identity",
    (key, value) => {
      const root = fixture();
      reviseManifest(root, (manifest) => {
        manifest[key] = value;
      });
      expect(check(root).stderr).toContain(
        "package manifest identity mismatch",
      );
    },
  );

  it("rejects an internal dependency from a different package release", () => {
    const root = fixture();
    reviseManifest(root, (manifest) => {
      manifest.dependencies["@asym/pdf-template-schema"] = "0.0.0";
    });
    expect(check(root).stderr).toContain("internal package version mismatch");
  });

  it("requires every exported entrypoint to be part of the package", () => {
    const root = fixture();
    reviseManifest(root, (manifest) => {
      manifest.exports["."] = "./dist/missing.mjs";
    });
    expect(check(root).stderr).toContain("missing package export target");
  });

  it.each(["package/../outside.mjs", "package/dist/INDEX.MJS"])(
    "rejects unsafe or case-colliding record paths: %s",
    (file) => {
      const root = fixture();
      reviseRecord(root, (record) => {
        record.packages[0].files.push({
          path: file,
          sha256: "f".repeat(64),
          bytes: 1,
        });
      });
      expect(check(root).stderr).toMatch(
        /unsafe relative package path|duplicate package file/,
      );
    },
  );

  it("rejects a package directory symlink to external bytes", () => {
    const root = fixture();
    const external = mkdtempSync(path.join(os.tmpdir(), "core-pdf-external-"));
    roots.push(external);
    const directory = "vendor/react-pdf-packages/asym-pdf-editor/dist";
    copyFileSync(
      path.join(root, directory, "index.mjs"),
      path.join(external, "index.mjs"),
    );
    rmSync(path.join(root, directory), { recursive: true });
    symlinkSync(
      external,
      path.join(root, directory),
      process.platform === "win32" ? "junction" : "dir",
    );
    expect(check(root).stderr).toContain("symlink forbidden");
  });
});
