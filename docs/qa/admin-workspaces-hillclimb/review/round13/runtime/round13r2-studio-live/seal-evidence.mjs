import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { evidenceRoot, repoRoot, save, sha256 } from "./gate.mjs";

const sourcePaths = [
  "apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/use-published-page-url.ts",
  "tests/unit/apps/admin/web-studio-published-page-link.test.tsx",
  "apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/grid-bulk-actions.tsx",
  "apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx",
  "apps/admin/src/cms-ui/web-studio/flows/studio-flow-frame.tsx",
  "apps/admin/src/cms-ui/web-studio/flows/studio-templates.tsx",
  "apps/admin/src/cms/collections/Pages.ts",
  "packages/ui/components/shadcn/searchable-select.tsx",
  "apps/admin/node_modules/@payloadcms/ui/dist/fields/Relationship/Input.js",
  "apps/admin/node_modules/@payloadcms/ui/dist/fields/Upload/Input.js",
  "apps/admin/node_modules/next/package.json",
  "apps/admin/node_modules/payload/package.json",
  "apps/admin/node_modules/@payloadcms/ui/package.json",
  "node_modules/playwright-core/package.json",
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/refreeze/round13r2-scheduling-decision.md",
];
save(join(evidenceRoot, "source-provenance.json"), {
  observedAtUtc: new Date().toISOString(),
  repoRoot,
  node: process.version,
  boundary:
    "Source paths and installed package metadata were read, not changed; this does not attest running compiled chunks independently.",
  sources: sourcePaths.map((path) => {
    const bytes = readFileSync(join(repoRoot, path));
    return {
      path,
      absolutePath: join(repoRoot, path),
      bytes: bytes.length,
      sha256: sha256(bytes),
    };
  }),
});

const report = readFileSync(join(evidenceRoot, "report.md"), "utf8");
const references = [...report.matchAll(/^\[([^\]]+)\]: (.+)$/gm)].map(
  (match) => ({
    name: match[1],
    target: match[2].replace(/:\d+(?::\d+)?$/, ""),
  }),
);
for (const reference of references)
  assert.ok(
    reference.name === "hashes" || existsSync(reference.target),
    `Missing report reference: ${reference.name}`,
  );
const qualification = JSON.parse(
  readFileSync(join(evidenceRoot, "qualification.json"), "utf8"),
);
assert.equal(qualification.checkCount, 46);
assert.equal(qualification.frozenBoundaryPairs, 12);
const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
const inventoryPath = join(evidenceRoot, "artifact-hashes.json");
assert.ok(!existsSync(inventoryPath));
const paths = walk(evidenceRoot).sort();
for (const path of paths)
  assert.ok(
    realpathSync(path).startsWith(realpathSync(evidenceRoot) + "/") ||
      realpathSync(path).startsWith(realpathSync(evidenceRoot) + "\\"),
    `Artifact outside owned scope: ${path}`,
  );
const files = paths.map((path) => {
  const bytes = readFileSync(path);
  const entry = {
    path: relative(evidenceRoot, path).replaceAll("\\", "/"),
    bytes: bytes.length,
    sha256: sha256(bytes),
  };
  if (path.endsWith(".png")) {
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    entry.imageDimensions = {
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
    };
  }
  return entry;
});
const inventorySha256 = sha256(JSON.stringify(files));
save(inventoryPath, {
  sealedAtUtc: new Date().toISOString(),
  evidenceRoot: resolve(evidenceRoot),
  fileCount: files.length,
  screenshotCount: files.filter((entry) => entry.path.endsWith(".png")).length,
  a11ySnapshotCount: files.filter((entry) => entry.path.endsWith(".a11y.yaml"))
    .length,
  excluded: ["artifact-hashes.json"],
  inventorySha256,
  files,
});
const sealed = JSON.parse(readFileSync(inventoryPath, "utf8"));
assert.equal(sha256(JSON.stringify(sealed.files)), sealed.inventorySha256);
assert.equal(sealed.screenshotCount, 52);
assert.equal(sealed.a11ySnapshotCount, 71);
for (const file of sealed.files) {
  assert.equal(statSync(join(evidenceRoot, file.path)).size, file.bytes);
  assert.equal(
    sha256(readFileSync(join(evidenceRoot, file.path))),
    file.sha256,
  );
}
console.log(
  JSON.stringify({
    sealed: true,
    fileCount: sealed.fileCount,
    screenshots: sealed.screenshotCount,
    a11ySnapshots: sealed.a11ySnapshotCount,
    reportReferenceCount: references.length,
    inventorySha256,
    inventoryFileSha256: sha256(readFileSync(inventoryPath)),
  }),
);
