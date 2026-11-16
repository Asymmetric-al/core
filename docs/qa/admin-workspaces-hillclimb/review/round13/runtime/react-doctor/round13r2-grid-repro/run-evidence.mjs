import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = realpathSync(process.cwd());
const owned = fileURLToPath(new URL(".", import.meta.url));
const relativeOwned = path.relative(root, owned).replaceAll("\\", "/");
if (
  root.replaceAll("\\", "/") !==
    "C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12" ||
  relativeOwned !==
    "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-grid-repro"
) {
  throw new Error(
    "The reproduction is confined to the authorized checkout and output directory.",
  );
}

const digest = (value) => createHash("sha256").update(value).digest("hex");
const fileHash = (filename) => digest(readFileSync(filename));
const writeJson = (name, value) =>
  writeFileSync(path.join(owned, name), `${JSON.stringify(value, null, 2)}\n`, {
    flag: "wx",
  });
const { auditSourceHashes } = await import(
  pathToFileURL(path.join(root, "scripts/react-doctor-audit.mjs")).href
);
const rootRequire = createRequire(path.join(root, "package.json"));
const uiRequire = createRequire(path.join(root, "packages/ui/package.json"));

function dependencyInputs() {
  return Object.fromEntries(
    [
      "react",
      "react-dom",
      "vitest",
      "vite",
      "jsdom",
      "@testing-library/react",
      "@vitejs/plugin-react",
      "@tanstack/react-table",
      "@base-ui/react",
    ].map((name) => {
      const resolver =
        name === "@base-ui/react" || name === "@tanstack/react-table"
          ? uiRequire
          : rootRequire;
      const entryPath = resolver.resolve(name);
      let packageDirectory = path.dirname(realpathSync(entryPath));
      let manifestPath;
      for (let depth = 0; depth < 8; depth += 1) {
        const candidate = path.join(packageDirectory, "package.json");
        if (
          existsSync(candidate) &&
          JSON.parse(readFileSync(candidate, "utf8")).name === name
        ) {
          manifestPath = candidate;
          break;
        }
        packageDirectory = path.dirname(packageDirectory);
      }
      if (!manifestPath)
        throw new Error(`Could not locate the installed manifest for ${name}.`);
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      return [
        name,
        {
          version: manifest.version,
          manifestPath: realpathSync(manifestPath),
          manifestSha256: fileHash(manifestPath),
          entryPath: realpathSync(entryPath),
          entrySha256: fileHash(entryPath),
        },
      ];
    }),
  );
}

function execute(label, executable, args) {
  const start = new Date().toISOString();
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 8 * 1024 * 1024,
    windowsHide: true,
  });
  const metadata = {
    cwd: root,
    executable,
    args,
    start,
    end: new Date().toISOString(),
    exitCode: result.status,
    signal: result.signal,
    error: result.error?.message ?? null,
    stdoutSha256: digest(result.stdout ?? ""),
    stderrSha256: digest(result.stderr ?? ""),
  };
  writeFileSync(path.join(owned, `${label}.stdout.log`), result.stdout ?? "", {
    flag: "wx",
  });
  writeFileSync(path.join(owned, `${label}.stderr.log`), result.stderr ?? "", {
    flag: "wx",
  });
  writeJson(`${label}.command.json`, metadata);
  console.log(
    `${label}: exit ${result.status}${result.error ? ` (${result.error.message})` : ""}`,
  );
  return { metadata, stdout: result.stdout ?? "" };
}

function existingTestAndHarnessHashes() {
  const hashes = {};
  const visit = (relative) => {
    const absolute = path.join(root, relative);
    if (!existsSync(absolute)) return;
    const info = lstatSync(absolute);
    if (info.isSymbolicLink())
      throw new Error(`Unexpected harness symlink: ${relative}`);
    if (info.isFile()) hashes[relative] = fileHash(absolute);
    else if (info.isDirectory()) {
      for (const entry of readdirSync(absolute).sort()) {
        if (entry !== "node_modules" && !entry.startsWith(".env"))
          visit(`${relative}/${entry}`);
      }
    }
  };
  visit("tests");
  visit("scripts");
  for (const entry of readdirSync(root).sort()) {
    if (
      /^(vitest[.].*|[^.].*[.]config[.](json|mts|ts|mjs|js)|bun[.]lock|package[.]json|tsconfig[.]json)$/.test(
        entry,
      )
    ) {
      if (lstatSync(path.join(root, entry)).isFile()) visit(entry);
    }
  }
  return hashes;
}

function capture(label) {
  const binding = execute(`${label}-binding`, process.execPath, [
    "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/refreeze/read-binding.mjs",
  ]);
  if (binding.metadata.exitCode !== 0)
    throw new Error(
      "Frozen binding verification failed; no tests authorized against a drifted input.",
    );
  const parsedBinding = JSON.parse(binding.stdout);
  const sourceHashes = auditSourceHashes(root);
  if (
    parsedBinding.manifestSha256 !==
      "27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0" ||
    parsedBinding.sourceInventorySha256 !==
      "a4b92ea2ba382845a752f0b64094632b40c6f8a4f35c370dabd7a8bb522e6cc3" ||
    sourceHashes[
      "packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx"
    ] !== "4c9693dd9fbc7a1d90ff31efbc8d9c6af59e0a9300efffca9a01436fc561d235"
  ) {
    throw new Error(
      "Input does not match the completed round13r2 qualification.",
    );
  }
  const gitPointer = readFileSync(path.join(root, ".git"), "utf8")
    .trim()
    .replace(/^gitdir: /, "");
  const gitDirectory = path.resolve(root, gitPointer);
  const head = execute(`${label}-head`, "git", [
    "--no-optional-locks",
    "rev-parse",
    "HEAD",
  ]);
  const branch = execute(`${label}-branch`, "git", [
    "--no-optional-locks",
    "symbolic-ref",
    "--short",
    "HEAD",
  ]);
  if (head.metadata.exitCode !== 0 || branch.metadata.exitCode !== 0)
    throw new Error("Read-only Git identity check failed.");
  const snapshot = {
    capturedAt: new Date().toISOString(),
    binding: parsedBinding,
    sourceHashes,
    existingTestAndHarnessHashes: existingTestAndHarnessHashes(),
    head: head.stdout.trim(),
    branch: branch.stdout.trim(),
    gitIndexSha256: fileHash(path.join(gitDirectory, "index")),
    qualificationReportSha256: fileHash(
      path.join(owned, "../round13r2-grid-qualification/report.md"),
    ),
    dependencyInputs: dependencyInputs(),
    reproductionInputHashes: Object.fromEntries(
      [
        "grid-rebinding.test.tsx",
        "dom-infrastructure.ts",
        "vitest.repro.config.mts",
        "run-evidence.mjs",
      ].map((filename) => [filename, fileHash(path.join(owned, filename))]),
    ),
  };
  writeJson(`${label}-freeze.json`, snapshot);
  return snapshot;
}

const label = process.argv[2];
if (!label || !/^[a-z][a-z0-9-]{0,40}$/.test(label))
  throw new Error("Supply a new, simple evidence-run label.");
const before = capture(`${label}-before`);
const commonArgs = [
  "node_modules/vitest/vitest.mjs",
  "run",
  "--config",
  `${relativeOwned}/vitest.repro.config.mts`,
  "--configLoader",
  "runner",
  "--no-cache",
  "--no-fsModuleCache",
  "--fsModuleCachePath",
  path.join(owned, "disabled-module-cache"),
  "--maxWorkers=1",
  "--no-fileParallelism",
  "--reporter=verbose",
  "--no-color",
  `${relativeOwned}/grid-rebinding.test.tsx`,
];
const characterization = execute(
  `${label}-characterization`,
  process.execPath,
  [...commonArgs, "--testNamePattern", "CHARACTERIZE"],
);
const rebinding = execute(`${label}-rebinding`, process.execPath, [
  ...commonArgs,
  "--testNamePattern",
  "REBIND",
]);
const after = capture(`${label}-after`);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const comparisons = {
  frozenBindingUnchanged: same(before.binding, after.binding),
  sourceHashesUnchanged: same(before.sourceHashes, after.sourceHashes),
  existingTestAndHarnessHashesUnchanged: same(
    before.existingTestAndHarnessHashes,
    after.existingTestAndHarnessHashes,
  ),
  headUnchanged: before.head === after.head,
  branchUnchanged: before.branch === after.branch,
  gitIndexUnchanged: before.gitIndexSha256 === after.gitIndexSha256,
  qualificationReportUnchanged:
    before.qualificationReportSha256 === after.qualificationReportSha256,
  reproductionInputsUnchanged: same(
    before.reproductionInputHashes,
    after.reproductionInputHashes,
  ),
  dependencyInputsUnchanged: same(
    before.dependencyInputs,
    after.dependencyInputs,
  ),
};
writeJson(`${label}-summary.json`, {
  characterizationExitCode: characterization.metadata.exitCode,
  rebindingExitCode: rebinding.metadata.exitCode,
  sourceFileCount: Object.keys(before.sourceHashes).length,
  existingTestAndHarnessFileCount: Object.keys(
    before.existingTestAndHarnessHashes,
  ).length,
  comparisons,
});
console.log(JSON.stringify(comparisons, null, 2));
if (Object.values(comparisons).some((value) => !value)) process.exitCode = 2;
else
  process.exitCode =
    characterization.metadata.exitCode || rebinding.metadata.exitCode || 0;
