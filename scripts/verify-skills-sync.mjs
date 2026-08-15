#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { cp, mkdtemp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, "..");
const gitSafeEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);
const unsupportedMirrorPaths = [".agent/skills"];
const comparedTrees = [
  ".agents/skills",
  ".cursor/skills",
  ".claude/skills",
  ".claude/commands",
  ".claude/agents",
];
const WINDOWS_TEMP_RETRY_CODES = new Set([
  "EPERM",
  "EACCES",
  "EBUSY",
  "ENOTEMPTY",
]);

function printHelp() {
  console.log(`Usage: node scripts/verify-skills-sync.mjs [--repo-root <path>]

Options:
  --repo-root <path>  Repository root to verify (default: parent of this script)
  --help, -h          Show this help

Checks that generated skill mirrors match canonical sources without writing
to the working tree. Run \`bun run skills:sync\` to update mirrors.`);
}

function parseArgs(argv) {
  let parsedRoot = null;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      return { help: true, repoRoot: parsedRoot };
    }

    if (argument === "--repo-root") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("Unknown argument: --repo-root requires a path");
      }
      parsedRoot = value;
      index += 1;
      continue;
    }

    if (argument.startsWith("--repo-root=")) {
      parsedRoot = argument.slice("--repo-root=".length);
      if (!parsedRoot) {
        throw new Error("Unknown argument: --repo-root requires a path");
      }
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return { help: false, repoRoot: parsedRoot };
}

function resolveGitDir(repoRoot) {
  const dotGitPath = path.join(repoRoot, ".git");
  let resolvedGitDir = dotGitPath;

  try {
    if (statSync(dotGitPath).isDirectory()) {
      return dotGitPath;
    }

    resolvedGitDir = path.resolve(
      repoRoot,
      readFileSync(dotGitPath, "utf8")
        .trim()
        .replace(/^gitdir:\s*/i, ""),
    );

    return resolvedGitDir;
  } catch (error) {
    console.error(`repoRoot: ${repoRoot}`);
    console.error(`resolvedGitDir: ${resolvedGitDir}`);
    console.error(
      "hint: ensure .git points to a readable gitdir and run the verifier from the repo root.",
    );
    throw error;
  }
}

function run(command, args, { cwd, encoding = "utf8", stdio }) {
  const result = spawnSync(command, args, {
    cwd,
    env: gitSafeEnv,
    encoding,
    stdio,
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function gitLsFiles(repoRoot, gitDir, extraArgs) {
  const result = run(
    "git",
    [
      `--git-dir=${gitDir}`,
      `--work-tree=${repoRoot}`,
      "ls-files",
      ...extraArgs,
    ],
    {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  if (result.status !== 0) {
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    process.exit(result.status ?? 1);
  }

  return (result.stdout ?? "").trim();
}

async function copyIfExists(source, destination) {
  if (!existsSync(source)) {
    return;
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}

function getErrorCode(error) {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
}

async function rmWithRetry(targetPath) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      const code = getErrorCode(error);
      if (!WINDOWS_TEMP_RETRY_CODES.has(code) || attempt === 7) {
        throw error;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 20 * 2 ** attempt);
      });
    }
  }
}

function posixRelative(from, to) {
  return path.relative(from, to).split(path.sep).join("/");
}

function normalizeNewlines(buffer) {
  return buffer.toString("utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

async function collectRelativeFiles(root) {
  const files = new Map();
  if (!existsSync(root)) {
    return files;
  }

  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.isFile() || entry.isSymbolicLink()) {
        files.set(posixRelative(root, fullPath), await readFile(fullPath));
      }
    }
  }

  await walk(root);
  return files;
}

function reportDriftAndExit() {
  console.error(
    "Skill mirror drift detected. Run `bun run skills:sync` and commit mirror updates.",
  );
  process.exit(1);
}

async function compareTrees(liveRoot, expectedRoot) {
  let drifted = false;

  for (const tree of comparedTrees) {
    const liveFiles = await collectRelativeFiles(path.join(liveRoot, tree));
    const expectedFiles = await collectRelativeFiles(
      path.join(expectedRoot, tree),
    );
    const keys = new Set([...liveFiles.keys(), ...expectedFiles.keys()]);

    for (const relativePath of keys) {
      const liveContent = liveFiles.get(relativePath);
      const expectedContent = expectedFiles.get(relativePath);

      if (!expectedContent) {
        drifted = true;
        continue;
      }
      if (!liveContent) {
        drifted = true;
        continue;
      }
      if (
        normalizeNewlines(liveContent) !== normalizeNewlines(expectedContent)
      ) {
        drifted = true;
      }
    }
  }

  return drifted;
}

async function renderExpectedMirrors(repoRoot, syncScriptPath) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "core-skills-verify-"));

  try {
    await copyIfExists(
      path.join(repoRoot, "docs", "ai", "skills"),
      path.join(tempRoot, "docs", "ai", "skills"),
    );
    await copyIfExists(
      path.join(repoRoot, ".agents", "skills"),
      path.join(tempRoot, ".agents", "skills"),
    );
    await copyIfExists(
      path.join(repoRoot, ".cursor", "commands"),
      path.join(tempRoot, ".cursor", "commands"),
    );
    await copyIfExists(
      path.join(repoRoot, ".cursor", "agents"),
      path.join(tempRoot, ".cursor", "agents"),
    );

    const syncResult = run(
      process.execPath,
      [syncScriptPath, "--repo-root", tempRoot],
      {
        cwd: repoRoot,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    if (syncResult.status !== 0) {
      if (syncResult.stdout) {
        process.stderr.write(syncResult.stdout);
      }
      if (syncResult.stderr) {
        process.stderr.write(syncResult.stderr);
      }
      throw new Error(
        "Unable to render expected skill mirrors for verification.",
      );
    }

    return tempRoot;
  } catch (error) {
    await rmWithRetry(tempRoot);
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const repoRoot = path.resolve(options.repoRoot ?? defaultRepoRoot);
  const gitDir = resolveGitDir(repoRoot);

  const unsupportedMirrorResult = gitLsFiles(repoRoot, gitDir, [
    "--cached",
    "--others",
    "--exclude-standard",
    "--",
    ...unsupportedMirrorPaths,
  ]);
  if (unsupportedMirrorResult) {
    console.error(unsupportedMirrorResult);
    console.error(
      "Unsupported singular skill mirror detected. Use `.agents/skills`, `.cursor/skills`, and `.claude/skills`; remove `.agent/skills`.",
    );
    process.exit(1);
  }

  const inngestScript = path.join(
    repoRoot,
    "scripts",
    "verify",
    "inngest-skill-references.mjs",
  );
  if (existsSync(inngestScript)) {
    const inngestResult = run(process.execPath, [inngestScript], {
      cwd: repoRoot,
      stdio: "inherit",
    });
    if (inngestResult.status !== 0) {
      process.exit(inngestResult.status ?? 1);
    }
  }

  const syncScriptPath = path.join(
    repoRoot,
    "scripts",
    "sync-agent-skills.mjs",
  );
  const expectedRoot = await renderExpectedMirrors(repoRoot, syncScriptPath);

  try {
    const drifted = await compareTrees(repoRoot, expectedRoot);
    if (drifted) {
      reportDriftAndExit();
    }
  } finally {
    await rmWithRetry(expectedRoot);
  }

  console.log("Skill mirrors match canonical sources.");
}

main().catch((error) => {
  if (error instanceof Error && error.message.startsWith("Unknown argument")) {
    console.error(error.message);
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});
