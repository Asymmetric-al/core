import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const repository = "https://github.com/Asymmetric-al/react-PDF";
const recordPath = "docs/maintenance/modernization/pdf-owner-release.json";
const receiptPath =
  "docs/maintenance/modernization/pdf-package-provenance.json";
const vendorPath = "vendor/react-pdf-packages";
const packageNames = [
  "docraptor-client",
  "pdf-template-schema",
  "pdf-renderer",
  "pdf-editor",
  "pdf-studio-adapter",
];
const approvedPackages = new Map(
  packageNames.map((name) => [`@asym/${name}`, `asym-${name}`]),
);
const commit = /^[a-f0-9]{40}$/;
const sha256 = /^[a-f0-9]{64}$/;
const version = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function safeRelativePath(relative) {
  requireCondition(
    typeof relative === "string" &&
      relative.length > 0 &&
      !relative.includes("\\") &&
      !relative.includes(":") &&
      !relative.includes("\0") &&
      !path.posix.isAbsolute(relative) &&
      relative
        .split("/")
        .every((part) => part && part !== "." && part !== ".."),
    "unsafe relative package path",
  );
  return relative;
}

function safePath(root, relative, kind) {
  const parts = safeRelativePath(relative).split("/");
  let absolute = root;
  for (const [index, part] of parts.entries()) {
    absolute = path.join(absolute, part);
    const stat = fs.lstatSync(absolute);
    requireCondition(!stat.isSymbolicLink(), `symlink forbidden: ${relative}`);
    const directory = index < parts.length - 1 || kind === "directory";
    requireCondition(
      directory ? stat.isDirectory() : stat.isFile(),
      `expected regular ${directory ? "directory" : "file"}: ${relative}`,
    );
  }
  return absolute;
}

function read(root, relative) {
  return fs.readFileSync(safePath(root, relative, "file"));
}

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function verifyBytes(bytes, expected, label) {
  requireCondition(
    Number.isSafeInteger(expected.bytes) && expected.bytes >= 0,
    `invalid byte length: ${label}`,
  );
  requireCondition(sha256.test(expected.sha256), `invalid hash: ${label}`);
  requireCondition(
    bytes.length === expected.bytes,
    `byte length mismatch: ${label}`,
  );
  requireCondition(
    digest(bytes) === expected.sha256,
    `hash mismatch: ${label}`,
  );
}

function unique(rows, key, label) {
  requireCondition(Array.isArray(rows), `missing ${label} inventory`);
  const seen = new Set();
  for (const row of rows) {
    requireCondition(
      row && typeof row[key] === "string",
      `invalid ${label} identity`,
    );
    const identity = row[key].toLowerCase();
    requireCondition(!seen.has(identity), `duplicate ${label} identity`);
    seen.add(identity);
  }
}

function inventory(root, relative) {
  const absolute = safePath(root, relative, "directory");
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = `${relative}/${entry.name}`;
    requireCondition(!entry.isSymbolicLink(), `symlink forbidden: ${child}`);
    return entry.isDirectory() ? inventory(root, child) : [child];
  });
}

function exportTargets(value) {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object")
    return Object.values(value).flatMap(exportTargets);
  return [];
}

function verify() {
  const root = fs.realpathSync(process.cwd());
  const receipt = JSON.parse(read(root, receiptPath));
  requireCondition(
    receipt.schemaVersion === 1,
    "unsupported provenance schema",
  );
  requireCondition(
    receipt.sourceRepository === repository,
    "unapproved source repository",
  );
  requireCondition(
    commit.test(receipt.sourceCommit) &&
      commit.test(receipt.reviewedReleaseCommit) &&
      commit.test(receipt.ownerMergeCommit) &&
      sha256.test(receipt.sourceLockSha256),
    "invalid source identity",
  );
  requireCondition(version.test(receipt.version), "invalid release version");
  requireCondition(receipt.license === "MIT", "unapproved package license");
  requireCondition(
    receipt.releaseRecord?.path === recordPath &&
      receipt.releaseRecord.url ===
        `${repository}/blob/${receipt.reviewedReleaseCommit}/docs/maintenance/core-pdf-modernization/artifact-release.json` &&
      sha256.test(receipt.releaseRecord.sha256),
    "invalid owner release record identity",
  );
  requireCondition(
    new RegExp(`^${repository}/pull/[1-9]\\d*$`).test(receipt.ownerPullRequest),
    "invalid owner pull request",
  );
  const recordBytes = read(root, recordPath);
  requireCondition(
    digest(recordBytes) === receipt.releaseRecord.sha256,
    "owner release record hash mismatch",
  );
  const record = JSON.parse(recordBytes);
  requireCondition(
    record.schemaVersion === 1 &&
      record.sourceRepository === repository &&
      record.sourceCommit === receipt.sourceCommit &&
      record.lockSha256 === receipt.sourceLockSha256 &&
      record.version === receipt.version,
    "owner source identity mismatch",
  );
  unique(record.packages, "name", "owner package");
  unique(receipt.packages, "name", "imported package");
  requireCondition(
    record.packages.length === approvedPackages.size &&
      receipt.packages.length === approvedPackages.size &&
      record.packages.every((pkg) => approvedPackages.has(pkg.name)) &&
      receipt.packages.every((pkg) => approvedPackages.has(pkg.name)),
    "expected exactly five approved package identities",
  );
  const rootEntries = [];
  let fileCount = 0;
  let licenseHash;
  for (const pkg of receipt.packages) {
    const directoryName = approvedPackages.get(pkg.name);
    const directory = `${vendorPath}/${directoryName}`;
    const archive = `${directory}-${receipt.version}.tgz`;
    const owner = record.packages.find((entry) => entry.name === pkg.name);
    requireCondition(
      pkg.directory === directory &&
        pkg.archive === archive &&
        pkg.version === receipt.version &&
        owner.version === receipt.version &&
        owner.artifact === path.posix.basename(archive) &&
        owner.sha256 === pkg.sha256 &&
        owner.bytes === pkg.bytes,
      `package identity mismatch: ${pkg.name}`,
    );
    verifyBytes(read(root, archive), owner, archive);
    unique(owner.files, "path", "package file");
    const expectedFiles = new Set();
    for (const file of owner.files) {
      requireCondition(
        file.path.startsWith("package/"),
        "invalid owner package path",
      );
      const relative = safeRelativePath(file.path.slice("package/".length));
      const installed = `${directory}/${relative}`;
      verifyBytes(read(root, installed), file, installed);
      expectedFiles.add(installed);
    }
    const actualFiles = inventory(root, directory);
    requireCondition(
      actualFiles.length === expectedFiles.size &&
        actualFiles.every((file) => expectedFiles.has(file)),
      `unexpected package files: ${pkg.name}`,
    );
    const manifest = JSON.parse(read(root, `${directory}/package.json`));
    requireCondition(
      manifest.name === pkg.name &&
        manifest.version === receipt.version &&
        manifest.license === "MIT" &&
        manifest.repository?.type === "git" &&
        manifest.repository.url === `${repository}.git` &&
        manifest.repository.directory ===
          `packages/${pkg.name.slice("@asym/".length)}`,
      `package manifest identity mismatch: ${pkg.name}`,
    );
    const license = read(root, `${directory}/LICENSE.md`);
    requireCondition(
      expectedFiles.has(`${directory}/LICENSE.md`) &&
        license
          .toString("utf8")
          .includes("Permission is hereby granted, free of charge"),
      `MIT license missing: ${pkg.name}`,
    );
    licenseHash ??= digest(license);
    requireCondition(
      digest(license) === licenseHash,
      "package license hashes differ",
    );
    for (const [name, selected] of Object.entries(
      manifest.dependencies ?? {},
    )) {
      if (name.startsWith("@asym/"))
        requireCondition(
          approvedPackages.has(name) && selected === receipt.version,
          `internal package version mismatch: ${pkg.name} -> ${name}`,
        );
    }
    const targets = exportTargets(manifest.exports);
    requireCondition(
      targets.length > 0,
      `missing package exports: ${pkg.name}`,
    );
    for (const target of targets)
      requireCondition(
        target.startsWith("./") &&
          expectedFiles.has(
            `${directory}/${safeRelativePath(target.slice(2))}`,
          ),
        `missing package export target: ${pkg.name}`,
      );
    rootEntries.push(directoryName, path.posix.basename(archive));
    fileCount += actualFiles.length;
  }
  const actualEntries = fs.readdirSync(safePath(root, vendorPath, "directory"));
  requireCondition(
    actualEntries.length === rootEntries.length &&
      actualEntries.every((entry) => rootEntries.includes(entry)),
    "unexpected vendor artifacts",
  );
  console.log(
    `[pdf-package-provenance] ${receipt.packages.length} packages, ${fileCount} files and all release archives verified`,
  );
}

try {
  verify();
} catch (error) {
  console.error(`[pdf-package-provenance] ${error.message}`);
  process.exitCode = 1;
}
