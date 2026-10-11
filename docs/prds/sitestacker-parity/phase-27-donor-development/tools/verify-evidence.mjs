#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../../../", import.meta.url));
const base = "docs/prds/sitestacker-parity/phase-27-donor-development";
const load = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = load(`${base}/source-manifest.json`);
const publication = load(`${base}/publication.json`);
const validation = load(`${base}/validation.json`);
const protectedPrefix = "docs/features/donor-development/grill/";
const advancedLog =
  "docs/features/donor-development/grill/phase27-grill-log.md";
const requiredLogs = [
  "docs/features/donor-development/grill/d11-evidence/source-probe/run.log",
  "docs/features/donor-development/grill/d16-evidence/source-probe/run.log",
  "docs/features/donor-development/grill/d17-evidence/source-probe/attempt1-run.log",
  "docs/features/donor-development/grill/d17-evidence/source-probe/run.log",
];

function verifyBytes(path, expectedHash, expectedBytes) {
  const bytes = readFileSync(resolve(root, path));
  assert.equal(digest(bytes), expectedHash, `${path}: SHA-256 mismatch`);
  if (expectedBytes !== undefined) {
    assert.equal(bytes.length, expectedBytes, `${path}: byte count mismatch`);
  }
}

function verifyHistoricalMetadata(record) {
  assert.match(record.sha256, /^[a-f0-9]{64}$/, "Invalid historical SHA-256");
  assert.ok(
    Number.isSafeInteger(record.bytes) && record.bytes > 0,
    "Invalid historical byte count",
  );
}

assert.deepEqual(validation.preservation.permitted_changes, [advancedLog]);
assert.equal(Object.keys(manifest.prior_working_tree_files).length, 377);
assert.equal(publication.artifacts.length, publication.counts.artifacts);
assert.equal(publication.counts.comments, 42);

// This is an archive guard, not a freeze on living glossary/specification files.
// The dated grill evidence is immutable. CONTEXT.md and normative documents may
// legitimately evolve; their publication hashes describe the historical capture.
// The renderer separately verifies current normative projections.
assert.deepEqual(
  Object.keys(manifest.prior_working_tree_files).filter(
    (path) => !path.startsWith(protectedPrefix),
  ),
  ["CONTEXT.md"],
);
for (const [path, expectedHash] of Object.entries(
  manifest.prior_working_tree_files,
)) {
  assert.match(expectedHash, /^[a-f0-9]{64}$/);
  if (path.startsWith(protectedPrefix) && path !== advancedLog) {
    verifyBytes(path, expectedHash);
  }
}

let glossaryArtifact;
for (const artifact of publication.artifacts) {
  verifyHistoricalMetadata(artifact);
  if (artifact.content_kind === "rendered_glossary_diff") {
    assert.equal(
      glossaryArtifact,
      undefined,
      "Duplicate glossary-diff artifact",
    );
    glossaryArtifact = artifact;
    assert.deepEqual(artifact.parts, ["P42"]);
    assert.equal(artifact.path, "CONTEXT.md");
    assert.equal(artifact.content_json.field, "content");
    const evidence = load(artifact.content_json.path);
    assert.equal(evidence.artifact, "P42");
    assert.equal(evidence.source_path, artifact.path);
    assert.equal(evidence.baseline_revision, manifest.repository_head);
    assert.equal(typeof evidence.content, "string");
    const bytes = Buffer.from(evidence.content, "utf8");
    assert.equal(
      bytes.length,
      artifact.bytes,
      "P42: content byte count mismatch",
    );
    assert.equal(
      digest(bytes),
      artifact.sha256,
      "P42: content SHA-256 mismatch",
    );
    assert.equal(artifact.source_file_snapshot.path, "CONTEXT.md");
    verifyHistoricalMetadata(artifact.source_file_snapshot);
    assert.equal(
      artifact.source_file_snapshot.sha256,
      manifest.current_glossary_sha256,
    );
    assert.equal(
      artifact.source_file_snapshot.sha256,
      manifest.prior_working_tree_files["CONTEXT.md"],
    );
  } else {
    assert.equal(
      artifact.content_kind,
      undefined,
      "Unknown publication content kind",
    );
    // Ordinary artifact hashes remain dated publication receipts. Only protected
    // grill content is compared with current bytes (including the advanced log).
    if (artifact.path.startsWith(protectedPrefix)) {
      verifyBytes(artifact.path, artifact.sha256, artifact.bytes);
    }
  }
}
assert.ok(glossaryArtifact, "Missing explicit P42 glossary-diff artifact");
assert.ok(
  publication.artifacts.some((artifact) => artifact.path === advancedLog),
);

const tracked = new Set(
  execFileSync("git", ["ls-files", "-z", "--", ...requiredLogs], {
    cwd: root,
    encoding: "utf8",
  }).split("\0"),
);
assert.deepEqual(
  Object.keys(manifest.prior_working_tree_files)
    .filter((path) => path.endsWith(".log"))
    .sort(),
  [...requiredLogs].sort(),
  "The archival log inventory changed; reconcile exact source evidence explicitly",
);
const untrackedLogs = requiredLogs.filter((path) => !tracked.has(path));
assert.deepEqual(
  untrackedLogs,
  [],
  "Historical evidence logs must be tracked in Git",
);

console.log(
  "Phase 27 archival evidence verified: 375 preserved grill files, one documented session-log advance, " +
    `metadata for ${publication.artifacts.length} historical artifacts, exact P42 glossary-diff content, ` +
    "and four tracked probe logs. Living glossary/normative files are not hash-frozen; " +
    "their historical capture metadata is not current-content or runtime qualification proof.",
);
