import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ZERO_SHA = "0000000000000000000000000000000000000000";
const MAX_FILES_PER_CHUNK = 120;

const lintableExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
  ".json",
  ".jsonc",
  ".css",
  ".scss",
  ".md",
  ".mdx",
  ".yml",
  ".yaml",
  ".html",
]);

const REPO_ROOT = runGitCommand(["rev-parse", "--show-toplevel"]);
const cwdRelativeToRoot = path
  .relative(REPO_ROOT, process.cwd())
  .replaceAll("\\", "/");
const scopePrefix =
  cwdRelativeToRoot && cwdRelativeToRoot !== "." ? `${cwdRelativeToRoot}/` : "";
const isCiRun =
  process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

function runGitCommand(args, { allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0 && !allowFailure) {
    const stderr = result.stderr?.trim() ?? "";
    throw new Error(`git ${args.join(" ")} failed: ${stderr}`);
  }

  return (result.stdout ?? "").trim();
}

function normalizeBaseSha(rawBaseSha) {
  if (!rawBaseSha || rawBaseSha === ZERO_SHA) {
    try {
      return runGitCommand(["rev-parse", "HEAD~1"]);
    } catch {
      return "";
    }
  }
  return rawBaseSha;
}

function getExtension(filePath) {
  const lastDot = filePath.lastIndexOf(".");
  if (lastDot === -1) {
    return "";
  }
  return filePath.slice(lastDot);
}

function isLintableFile(filePath) {
  const absolutePath = path.join(REPO_ROOT, filePath);
  if (!existsSync(absolutePath)) {
    return false;
  }

  const stats = statSync(absolutePath);
  if (!stats.isFile()) {
    return false;
  }

  return lintableExtensions.has(getExtension(filePath));
}

function chunkArray(values, chunkSize) {
  const chunks = [];
  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }
  return chunks;
}

function runUltraciteCheck(files) {
  const chunks = chunkArray(files, MAX_FILES_PER_CHUNK);
  let hasFailures = false;

  for (const chunk of chunks) {
    const absoluteChunk = chunk.map((filePath) =>
      path.join(REPO_ROOT, filePath)
    );
    const result = spawnSync("bunx", ["ultracite", "check", ...absoluteChunk], {
      stdio: "inherit",
      encoding: "utf8",
    });
    if (result.status !== 0) {
      hasFailures = true;
    }
  }

  return hasFailures ? 1 : 0;
}

function isInScope(filePath) {
  if (!scopePrefix) {
    return true;
  }

  return filePath === cwdRelativeToRoot || filePath.startsWith(scopePrefix);
}

function getWorkingTreeChangedFiles() {
  const trackedChangedOutput = runGitCommand(
    ["diff", "--name-only", "--diff-filter=ACMRTUXB", "HEAD"],
    { allowFailure: true }
  );
  const untrackedOutput = runGitCommand(
    ["ls-files", "--others", "--exclude-standard"],
    { allowFailure: true }
  );

  return new Set(
    [trackedChangedOutput, untrackedOutput]
      .join("\n")
      .split("\n")
      .map((filePath) => filePath.trim())
      .filter(Boolean)
  );
}

function main() {
  const explicitBaseSha = process.env.LINT_BASE_SHA || "";
  const explicitHeadSha = process.env.LINT_HEAD_SHA || "";

  const changedFiles = [];
  if (explicitBaseSha || explicitHeadSha) {
    const headSha = explicitHeadSha || runGitCommand(["rev-parse", "HEAD"]);
    const baseSha = normalizeBaseSha(explicitBaseSha);

    if (!baseSha) {
      const message = "No base SHA available for changed-file lint check.";
      if (isCiRun) {
        console.error(`${message} Failing CI instead of skipping lint.`);
        process.exit(1);
      }
      console.log(`${message} Skipping.`);
      process.exit(0);
    }

    const changedFilesOutput = runGitCommand([
      "diff",
      "--name-only",
      "--diff-filter=ACMRTUXB",
      `${baseSha}...${headSha}`,
    ]);
    changedFiles.push(
      ...changedFilesOutput
        .split("\n")
        .map((filePath) => filePath.trim())
        .filter(Boolean)
    );

    console.log(
      `Checking files changed in range ${baseSha.slice(0, 12)}...${headSha.slice(0, 12)}`
    );
  } else {
    changedFiles.push(...getWorkingTreeChangedFiles());
    console.log("Checking lintable files changed in current working tree.");
  }

  const lintableFiles = [...new Set(changedFiles)]
    .filter(isInScope)
    .filter(isLintableFile);

  if (lintableFiles.length === 0) {
    console.log(
      "No lintable changed files detected. Skipping ultracite check."
    );
    process.exit(0);
  }

  console.log(
    `Running ultracite check on ${lintableFiles.length} changed files.`
  );

  const exitCode = runUltraciteCheck(lintableFiles);
  process.exit(exitCode);
}

main();
