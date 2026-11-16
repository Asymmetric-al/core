import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const outputRoot = dirname(fileURLToPath(import.meta.url));
const repo = realpathSync(process.cwd());
if (!repo.replaceAll("\\", "/").endsWith("/t3-5a24111d-r12"))
  throw new Error("Wrong checkout");
export const harnessRoot = join(repo, "docs/qa/admin-workspaces-hillclimb");
const { prepareFixtureBundle } = await import(
  pathToFileURL(join(harnessRoot, "fixture-preflight.mjs"))
);
const steps = [];
export const prepared = prepareFixtureBundle({
  run(command, args, options) {
    const started = Date.now();
    const result = spawnSync(command, args, { ...options, timeout: 55000 });
    steps.push({
      command,
      args,
      milliseconds: Date.now() - started,
      status: result.status,
    });
    return result;
  },
});
export const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");
export const fixtureBundle = prepared.bundle;
mkdirSync(outputRoot, { recursive: true });
writeFileSync(
  join(outputRoot, "fixture-proof.json"),
  JSON.stringify({ ...prepared.proof, steps }, null, 2),
);
const manifest = JSON.parse(
  readFileSync(join(harnessRoot, "snapshots/round13-manifest.json"), "utf8"),
);
const mismatches = [];
for (const entry of manifest.files) {
  if (!entry.sha256) continue;
  if (entry.sha256 === "absent") {
    if (existsSync(join(repo, entry.path)))
      mismatches.push({ path: entry.path, expected: "absent" });
    continue;
  }
  try {
    const current = sha256(readFileSync(join(repo, entry.path)));
    if (current !== entry.sha256)
      mismatches.push({ path: entry.path, expected: entry.sha256, current });
  } catch (error) {
    mismatches.push({ path: entry.path, error: error.message });
  }
}
const frozen = {
  checkedAt: new Date().toISOString(),
  entries: manifest.files.length,
  diffSha256: sha256(readFileSync(join(harnessRoot, "snapshots/round13.diff"))),
  expectedDiffSha256:
    "8e4c354259160e26be0fed1a3308ae87452b5fe6c58ea1c5448c1ffcbd143547",
  manifestSha256: sha256(
    readFileSync(join(harnessRoot, "snapshots/round13-manifest.json")),
  ),
  mismatches,
  extras: "Not recomputed: no git commands; writes confined to owned evidence",
};
writeFileSync(
  join(outputRoot, "frozen-source-proof.json"),
  JSON.stringify(frozen, null, 2),
);
if (frozen.diffSha256 !== frozen.expectedDiffSha256 || mismatches.length)
  throw new Error("Frozen candidate mismatch");
const details =
  fixtureBundle.details[
    "GET /api/admin/contribution-operations/:contributionId"
  ];
writeFileSync(
  join(outputRoot, "regenerated-fixture-inspection.json"),
  JSON.stringify(
    {
      metadata: fixtureBundle.captureMeta,
      contributionRows: fixtureBundle.datasets.contributions,
      details,
      reportKeys: Object.keys(fixtureBundle.endpoints).filter((key) =>
        /report|fund/i.test(key),
      ),
    },
    null,
    2,
  ),
);
if (process.argv[1] === fileURLToPath(import.meta.url))
  console.log(
    JSON.stringify(
      {
        frozen,
        fixtureProof: prepared.proof,
        metadata: fixtureBundle.captureMeta,
        detailCount: Object.keys(details).length,
        firstDetail: Object.entries(details).slice(0, 1),
        contributionCount: fixtureBundle.datasets.contributions.length,
      },
      null,
      2,
    ),
  );
