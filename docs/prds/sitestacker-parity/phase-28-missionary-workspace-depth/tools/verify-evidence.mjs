import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const archive = "docs/features/missionary-workspace-depth/grill/";

export function verifyEvidenceFiles(root, records) {
  assert.ok(Array.isArray(records), "Evidence files must be an array");
  const names = new Set();
  for (const record of records) {
    assert.equal(typeof record.path, "string");
    assert.ok(
      record.path.startsWith(archive) &&
        !record.path.includes("\\") &&
        path.posix.normalize(record.path) === record.path,
      `Invalid archive path: ${record.path}`,
    );
    assert.ok(
      !names.has(record.path),
      `Duplicate archive path: ${record.path}`,
    );
    names.add(record.path);
    assert.match(record.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(record.bytes) && record.bytes >= 0);
    const file = path.resolve(root, record.path);
    assert.ok(
      lstatSync(file).isFile(),
      `${record.path}: expected a regular file`,
    );
    const bytes = readFileSync(file);
    assert.equal(
      bytes.length,
      record.bytes,
      `${record.path}: byte count mismatch`,
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      record.sha256,
      `${record.path}: SHA-256 mismatch`,
    );
  }
  const tracked = execFileSync("git", ["ls-files", "-z", "--", archive], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  assert.deepEqual(
    [...names].sort(),
    tracked.sort(),
    "Tracked archive inventory differs from the source manifest",
  );
  return names.size;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const root = fileURLToPath(new URL("../../../../../", import.meta.url));
  const manifest = JSON.parse(
    readFileSync(new URL("../source-manifest.json", import.meta.url), "utf8"),
  );
  assert.equal(
    manifest.files.length,
    911,
    "Historical archive inventory changed",
  );
  const count = verifyEvidenceFiles(root, manifest.files);
  console.log(
    `Phase 28 archival evidence verified: ${count} tracked files. Historical programs were not executed; current documents are checked separately from dated publication receipts.`,
  );
}
