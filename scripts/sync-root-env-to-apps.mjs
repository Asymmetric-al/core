import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_APPS = ["admin", "donor", "missionary"];

function isSameHardLink(dest, source) {
  const destStat = fs.statSync(dest);
  const sourceStat = fs.statSync(source);
  return (
    destStat.dev === sourceStat.dev &&
    destStat.ino !== 0 &&
    destStat.ino === sourceStat.ino
  );
}

function isLinkedToRootEnv(dest, source, stat = fs.lstatSync(dest)) {
  if (!stat.isSymbolicLink()) {
    return isSameHardLink(dest, source);
  }

  const target = fs.readlinkSync(dest);
  return path.resolve(path.dirname(dest), target) === source;
}

function createRootEnvLink(source, dest) {
  const relativeSource = path.relative(path.dirname(dest), source);

  try {
    fs.symlinkSync(relativeSource, dest);
  } catch (error) {
    if (
      process.platform !== "win32" ||
      (error.code !== "EPERM" && error.code !== "EACCES")
    ) {
      throw error;
    }

    fs.linkSync(source, dest);
  }
}

export function linkRootEnvToApps(
  repoRoot,
  { apps = DEFAULT_APPS, force = false } = {},
) {
  const source = path.join(repoRoot, ".env.local");

  if (!fs.existsSync(source)) {
    return [
      {
        status: "missing-source",
        source,
      },
    ];
  }

  return apps.map((app) => {
    const dest = path.join(repoRoot, "apps", app, ".env.local");
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    if (fs.existsSync(dest)) {
      const stat = fs.lstatSync(dest);

      if (isLinkedToRootEnv(dest, source, stat)) {
        return { status: "unchanged", app, source, dest };
      }

      if (!force) {
        return { status: "refused", app, source, dest };
      }

      fs.rmSync(dest, { force: true });
    }

    createRootEnvLink(source, dest);

    return {
      status: force ? "relinked" : "linked",
      app,
      source,
      dest,
    };
  });
}

function printResult(result) {
  if (result.status === "missing-source") {
    process.stderr.write(
      `[sync-root-env] No repo-root .env.local found at ${result.source}; create one from your secrets provider.\n`,
    );
    return;
  }

  if (result.status === "refused") {
    process.stderr.write(
      `[sync-root-env] Refusing to overwrite existing ${result.dest}; rerun with --force to replace it with a link to ${result.source}.\n`,
    );
    return;
  }

  process.stdout.write(
    `[sync-root-env] ${result.status}: ${result.dest} -> ${result.source}\n`,
  );
}

function main() {
  const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
  const force = process.argv.includes("--force");
  const results = linkRootEnvToApps(repoRoot, { force });

  for (const result of results) {
    printResult(result);
  }

  if (results.some((result) => result.status === "refused")) {
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
