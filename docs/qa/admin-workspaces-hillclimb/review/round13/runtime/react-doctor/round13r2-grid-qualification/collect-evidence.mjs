import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = realpathSync(process.cwd());
const output = path.dirname(fileURLToPath(import.meta.url));
const expected = path.join(
  root,
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-qualification",
);
if (
  root !==
    "C:\\Users\\Conrad\\.t3\\worktrees\\core\\t3-5a24111d-r12".replaceAll(
      "\\\\",
      "\\",
    ) ||
  output !== expected
)
  throw new Error("Wrong qualification workspace");
const digest = (value) => createHash("sha256").update(value).digest("hex");
const save = (name, value) =>
  writeFileSync(path.join(output, name), value, { flag: "wx" });
const json = (name, value) => save(name, JSON.stringify(value, null, 2) + "\n");
const git = (args) => {
  const result = spawnSync("git", ["--no-optional-locks", ...args], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0 || result.error)
    throw new Error(
      result.stderr || result.error?.message || "Git read failed",
    );
  return result.stdout;
};
const mode = process.argv[2];
if (mode === "before" || mode === "after") {
  const argv = [
    "node",
    "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/refreeze/read-binding.mjs",
  ];
  const startedAt = new Date().toISOString();
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
    timeout: 120000,
  });
  save(`binding-${mode}.stdout.log`, result.stdout || "");
  save(`binding-${mode}.stderr.log`, result.stderr || "");
  json(`binding-${mode}.command.json`, {
    argv,
    cwd: root,
    startedAt,
    endedAt: new Date().toISOString(),
    exitCode: result.status,
    signal: result.signal,
    error: result.error?.message || null,
  });
  if (result.status !== 0 || result.error)
    throw new Error("Frozen binding helper failed");
  const binding = JSON.parse(result.stdout);
  const baseline = JSON.parse(
    readFileSync(
      path.join(
        root,
        "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh/binding-before.json",
      ),
      "utf8",
    ),
  );
  if (JSON.stringify(binding) !== JSON.stringify(baseline))
    throw new Error("Fresh audit binding mismatch");
  const { auditSourceHashes } = await import(
    pathToFileURL(path.join(root, "scripts/react-doctor-audit.mjs")).href
  );
  const sourceHashes = auditSourceHashes(root);
  const auxiliaryPaths = git([
    "ls-files",
    "-z",
    "--cached",
    "--others",
    "--exclude-standard",
    "--",
    "tests",
    "scripts",
  ])
    .split("\0")
    .filter(Boolean);
  const auxiliaryHashes = Object.fromEntries(
    [...new Set(auxiliaryPaths)]
      .sort()
      .filter((relative) => existsSync(path.join(root, relative)))
      .map((relative) => [
        relative,
        digest(readFileSync(path.join(root, relative))),
      ]),
  );
  const indexPath = path.resolve(
    root,
    git(["rev-parse", "--git-path", "index"]).trim(),
  );
  const snapshot = {
    at: new Date().toISOString(),
    binding,
    head: git(["rev-parse", "HEAD"]).trim(),
    branch: git(["branch", "--show-current"]).trim(),
    indexSha256: digest(readFileSync(indexPath)),
    sourceHashes,
    auxiliaryHashes,
  };
  json(`snapshot-${mode}.json`, snapshot);
  save(
    `git-status-${mode}.nul`,
    git(["status", "--porcelain=v1", "-z", "--untracked-files=all"]),
  );
  let comparison = null;
  if (mode === "after") {
    const before = JSON.parse(
      readFileSync(path.join(output, "snapshot-before.json"), "utf8"),
    );
    comparison = Object.fromEntries(
      [
        "binding",
        "head",
        "branch",
        "indexSha256",
        "sourceHashes",
        "auxiliaryHashes",
      ].map((key) => [
        key,
        JSON.stringify(before[key]) === JSON.stringify(snapshot[key]),
      ]),
    );
    json("binding-comparison.json", comparison);
    if (Object.values(comparison).some((value) => !value))
      throw new Error("Source, auxiliary or Git binding drift");
  }
  console.log(
    JSON.stringify(
      {
        mode,
        matchesFreshAudit: true,
        sourceCount: Object.keys(sourceHashes).length,
        auxiliaryCount: Object.keys(auxiliaryHashes).length,
        head: snapshot.head,
        branch: snapshot.branch,
        sourceInventorySha256: binding.sourceInventorySha256,
        comparison,
      },
      null,
      2,
    ),
  );
} else {
  throw new Error("Use before or after");
}
