import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(process.cwd());
const evidence = path.dirname(fileURLToPath(import.meta.url));
assert.equal(root, "C:\\Users\\Conrad\\.t3\\worktrees\\core\\t3-5a24111d-r12");
assert.equal(
  path.dirname(evidence),
  path.join(
    root,
    "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor",
  ),
);
const digest = (value) => createHash("sha256").update(value).digest("hex");
const readJson = (relative) =>
  JSON.parse(readFileSync(path.join(evidence, relative), "utf8"));
const json = (relative, value) =>
  writeFileSync(
    path.join(evidence, relative),
    JSON.stringify(value, null, 2) + "\n",
    { flag: "wx" },
  );
const finalName = "evidence-index-final.json";
assert.equal(existsSync(path.join(evidence, finalName)), false);
const validation = readJson("handback-validation.json");
assert.equal(validation.artifactsValid, true);
assert.deepEqual(validation.failures, []);
assert.equal(validation.strictPassed, false);
assert.equal(validation.modes.strict.command.exitCode, 1);
assert.equal(validation.modes.raw.command.exitCode, 0);
assert.equal(validation.applicableExactIdentityParity, true);
assert.equal(
  validation.ledger.freshUnresolvedAfterMechanicallyExactPriorSubset,
  629,
);
assert.equal(validation.ledger.unresolvedErrors, 2);
const proposalReview = readJson("handback-proposal-review.json");
assert.equal(proposalReview.rebindingsIndividuallyRevalidated, 7);
assert.equal(proposalReview.retirementsIndividuallyRevalidated, 41);
assert.equal(proposalReview.remainingStaleCount, 195);
assert.equal(proposalReview.newApprovals, 0);
assert.equal(proposalReview.ledgerMutations, 0);
const report = readFileSync(path.join(evidence, "report.md"), "utf8");
assert.equal(digest(Buffer.from(report)), proposalReview.reportSha256);
const definitions = [...report.matchAll(/^\[([^\]]+)\]: (C:\/.+)$/gm)].map(
  (match) => ({ id: match[1], reference: match[2].replace(/\r$/, "") }),
);
const identifiers = new Set(definitions.map((definition) => definition.id));
assert.equal(definitions.length, 43);
assert.equal(identifiers.size, definitions.length);
for (const match of report.matchAll(/\]\[([^\]]+)\]/g))
  assert.equal(
    identifiers.has(match[1]),
    true,
    `Missing report reference ${match[1]}`,
  );
function checkReferences(allowPendingIndex) {
  for (const definition of definitions) {
    const relativeReference = definition.reference.replace(
      /:\d+(?::\d+)?$/,
      "",
    );
    const absolute = path.resolve(relativeReference);
    assert.equal(
      absolute.startsWith(root + path.sep),
      true,
      `Reference escapes checkout: ${definition.id}`,
    );
    if (allowPendingIndex && absolute === path.join(evidence, finalName))
      continue;
    assert.equal(
      statSync(absolute).isFile(),
      true,
      `Reference not a file: ${definition.id}`,
    );
    assert.equal(
      realpathSync(absolute).startsWith(root + path.sep),
      true,
      `Reference symlink escaped checkout: ${definition.id}`,
    );
  }
}
checkReferences(true);
function inventory(directory, prefix = "") {
  const rows = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (relative === finalName) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) rows.push(...inventory(absolute, relative + "/"));
    else {
      assert.equal(
        entry.isFile(),
        true,
        `Unexpected evidence symlink ${relative}`,
      );
      const bytes = readFileSync(absolute);
      rows.push({ path: relative, bytes: bytes.length, sha256: digest(bytes) });
    }
  }
  return rows.sort((first, second) => first.path.localeCompare(second.path));
}
const startingEntries = inventory(evidence);
json("evidence-seal.json", {
  checkedAt: new Date().toISOString(),
  status: "handback-inputs-verified-index-followed-by-full-readback",
  reportSha256: digest(Buffer.from(report)),
  reportReferenceCount: definitions.length,
  finalHandback: {
    artifactsValid: validation.artifactsValid,
    strictPassed: false,
    strictExit: 1,
    rawExit: 0,
    unresolved: 629,
    unresolvedErrors: 2,
  },
  candidate: {
    checkpoint: validation.declared.checkpoint,
    manifestSha256: validation.declared.manifestSha256,
    diffSha256: validation.declared.diffSha256,
    sourceInventorySha256: validation.declared.sourceInventorySha256,
  },
  completeEvidenceFileCountExcludingIndex: startingEntries.length + 1,
  finalIndex: finalName,
  procedure:
    "Index excludes only itself. After recording it, enumerate and rehash every other evidence file again, compare exact path/byte/hash rows, and check every report reference. The process exits nonzero on any mismatch.",
});
const entries = inventory(evidence);
json(finalName, {
  generatedAt: new Date().toISOString(),
  excludesSelf: true,
  excludedPaths: [finalName],
  files: entries,
});
assert.deepEqual(inventory(evidence), entries);
assert.deepEqual(readJson(finalName).files, entries);
checkReferences(false);
console.log(
  JSON.stringify(
    {
      status: "sealed-and-readback-verified",
      evidenceRoot: evidence,
      evidenceFileCountExcludingIndex: entries.length,
      totalIndexedBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
      reportReferenceCount: definitions.length,
      indexSha256: digest(readFileSync(path.join(evidence, finalName))),
      strictExit: 1,
      rawExit: 0,
      strictAccepted: false,
    },
    null,
    2,
  ),
);
