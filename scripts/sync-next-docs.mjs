#!/usr/bin/env node
/**
 * Keep the committed `.next-docs/` fallback identical to the documentation
 * bundled with the installed `next` package.
 *
 *   node scripts/sync-next-docs.mjs            check only; exits 1 on drift
 *   node scripts/sync-next-docs.mjs --write    rewrite the fallback to match
 *
 * Agents read `.next-docs/` when dependencies are not installed, so it must
 * describe the pinned release and not whichever release was current when the
 * fallback was last generated. The installed package is the only source: this
 * script never downloads anything and never edits `AGENTS.md`.
 */
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const FALLBACK_DIRECTORY = ".next-docs";
const FIX_COMMAND = "node scripts/sync-next-docs.mjs --write";

const normalize = (text) => text.replaceAll("\r\n", "\n");

/** The package ships `.md`; the committed fallback keeps its `.mdx` names. */
const fallbackName = (installedName) => installedName.replace(/\.md$/u, ".mdx");

async function filesUnder(root, prefix = "") {
  const files = [];
  for (const entry of await readdir(path.join(root, prefix), {
    withFileTypes: true,
  })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(root, relative)));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

/**
 * Locate the installed `next` package from `root`. Returns null when
 * dependencies are not installed.
 */
export function resolveInstalledNextDocs(root = repoRoot) {
  let manifestPath;
  try {
    manifestPath = createRequire(path.join(root, "package.json")).resolve(
      "next/package.json",
    );
  } catch {
    return null;
  }
  const { version } = JSON.parse(readFileSync(manifestPath, "utf8"));
  return {
    version,
    docsRoot: path.join(path.dirname(manifestPath), "dist", "docs"),
  };
}

/**
 * Compare the installed docs with the fallback and, when `write` is set, make
 * the fallback an exact mirror. Check mode never writes.
 */
export async function runNextDocsSync({
  installedRoot,
  fallbackRoot,
  version,
  write,
}) {
  const installed = existsSync(installedRoot)
    ? (await filesUnder(installedRoot)).filter((file) => file.endsWith(".md"))
    : [];
  if (installed.length === 0)
    throw new Error(
      `Installed Next.js docs not found at ${installedRoot}. Run \`bun install\` first.`,
    );

  const expected = new Map(installed.map((file) => [fallbackName(file), file]));
  const existing = new Set(
    existsSync(fallbackRoot) ? await filesUnder(fallbackRoot) : [],
  );
  const read = async (root, file) =>
    normalize(await readFile(path.join(root, file), "utf8"));

  const changed = [];
  const missing = [];
  for (const [target, source] of expected) {
    if (!existing.has(target)) missing.push(target);
    else if (
      (await read(installedRoot, source)) !== (await read(fallbackRoot, target))
    )
      changed.push(target);
  }
  const stale = [...existing].filter((file) => !expected.has(file)).sort();
  const drift = changed.length + missing.length + stale.length;

  if (write && drift > 0) {
    for (const target of [...missing, ...changed]) {
      const destination = path.join(fallbackRoot, target);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(
        destination,
        await read(installedRoot, expected.get(target)),
        "utf8",
      );
    }
    for (const file of stale) await rm(path.join(fallbackRoot, file));
  }

  const counts = `${changed.length} changed, ${missing.length} missing, ${stale.length} stale`;
  const message =
    drift === 0
      ? `${FALLBACK_DIRECTORY} matches next@${version} (${expected.size} pages).`
      : write
        ? `${FALLBACK_DIRECTORY} rewritten to match next@${version} (${expected.size} pages; ${counts}).`
        : `${FALLBACK_DIRECTORY} does not match next@${version}: ${counts}. Run \`${FIX_COMMAND}\` and commit the result.`;

  return {
    ok: drift === 0 || write,
    changed,
    missing,
    stale,
    pages: expected.size,
    message,
  };
}

async function main(argv) {
  const unknown = argv.filter((arg) => arg !== "--write" && arg !== "--check");
  if (unknown.length > 0)
    throw new Error(`Unknown argument: ${unknown.join(" ")}`);

  const installed = resolveInstalledNextDocs();
  if (!installed)
    throw new Error(
      "The next package is not installed. Run `bun install` first.",
    );

  const result = await runNextDocsSync({
    installedRoot: installed.docsRoot,
    fallbackRoot: path.join(repoRoot, FALLBACK_DIRECTORY),
    version: installed.version,
    write: argv.includes("--write"),
  });
  console.log(result.message);
  if (!result.ok) {
    for (const [label, files] of [
      ["changed", result.changed],
      ["missing", result.missing],
      ["stale", result.stale],
    ])
      for (const file of files) console.log(`  ${label}: ${file}`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
