import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
const { auditSourceHashes } = await import(
  pathToFileURL(path.resolve("scripts/react-doctor-audit.mjs")).href
);
const { evidenceFileHash } = await import(
  pathToFileURL(path.resolve("scripts/react-doctor-ledger.mjs")).href
);
const { REACT_DOCTOR_VERSION } = await import(
  pathToFileURL(path.resolve("scripts/react-doctor-first-party.mjs")).href
);

const root = realpathSync(process.cwd());
const manifestPath =
  "docs/qa/admin-workspaces-hillclimb/snapshots/round13r2-manifest.json";
const diffPath = "docs/qa/admin-workspaces-hillclimb/snapshots/round13r2.diff";
const digest = (value) => createHash("sha256").update(value).digest("hex");
const scopedPath = (relative) => {
  if (
    typeof relative !== "string" ||
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    relative
      .split("/")
      .some(
        (part) =>
          part === ".." ||
          part === ".git" ||
          part === "node_modules" ||
          part.startsWith(".env"),
      )
  ) {
    throw new Error("Unsafe freeze input path");
  }
  const absolute = path.resolve(root, relative);
  if (
    !absolute.startsWith(root + path.sep) ||
    (existsSync(absolute) &&
      !realpathSync(absolute).startsWith(root + path.sep))
  ) {
    throw new Error("Freeze input escaped the checkout");
  }
  return absolute;
};
const hashFile = (relative) => digest(readFileSync(scopedPath(relative)));
const manifest = JSON.parse(readFileSync(scopedPath(manifestPath), "utf8"));
if (
  manifest.checkpoint !== "round13r2" ||
  !manifest.base ||
  !Array.isArray(manifest.files) ||
  manifest.files.length === 0 ||
  new Set(manifest.files.map((entry) => entry.path)).size !==
    manifest.files.length
) {
  throw new Error("Missing, wrong, or duplicate freeze inventory");
}
if (hashFile(diffPath) !== manifest.diffSha256)
  throw new Error("Frozen diff changed");
for (const entry of manifest.files) {
  if (entry.status === "D") {
    if (entry.sha256 !== "absent" || existsSync(scopedPath(entry.path))) {
      throw new Error(`Frozen deletion mismatch: ${entry.path}`);
    }
  } else if (
    !/^[a-f0-9]{64}$/.test(entry.sha256) ||
    hashFile(entry.path) !== entry.sha256
  ) {
    throw new Error(`Frozen file mismatch: ${entry.path}`);
  }
}
const ledgerPath = "docs/qa/react-doctor/exceptions.json";
const ledger = JSON.parse(readFileSync(scopedPath(ledgerPath), "utf8"));
if (!Array.isArray(ledger.exceptions))
  throw new Error("Invalid ledger envelope");
const controls = new Set([
  "package.json",
  "bun.lock",
  "doctor.config.json",
  ledgerPath,
  "scripts/react-doctor-audit.mjs",
  "scripts/react-doctor-first-party.mjs",
  "scripts/react-doctor-ledger.mjs",
  "scripts/git/environment.mjs",
]);
for (const record of ledger.exceptions) {
  for (const relative of Object.keys(record.evidenceFileHashes ?? {})) {
    evidenceFileHash(root, relative);
    controls.add(relative);
  }
}
console.log(
  JSON.stringify({
    root,
    checkpoint: manifest.checkpoint,
    base: manifest.base,
    manifestPath,
    manifestSha256: hashFile(manifestPath),
    diffPath,
    diffSha256: hashFile(diffPath),
    sourceInventorySha256: digest(JSON.stringify(auditSourceHashes(root))),
    controlHashes: Object.fromEntries(
      [...controls].sort().map((relative) => [relative, hashFile(relative)]),
    ),
    nodeVersion: process.version,
    reactDoctorVersion: REACT_DOCTOR_VERSION,
  }),
);
