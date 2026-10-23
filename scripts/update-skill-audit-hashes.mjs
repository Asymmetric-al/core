#!/usr/bin/env node
/**
 * Update only explicitly reviewed installed payload hashes after skills:sync.
 * This does not refresh sources or approve provenance, licensing or API currency.
 * node scripts/update-skill-audit-hashes.mjs --skill <name> [--skill <name>]
 */
import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

const defaultRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const safeName = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

async function regularPath(root, relative, directory) {
  const parts = relative.split("/");
  let current = root;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const stat = await lstat(current);
    if (stat.isSymbolicLink()) throw new Error(`Refusing symlink: ${current}`);
    const expectedDirectory = index < parts.length - 1 || directory;
    if (expectedDirectory ? !stat.isDirectory() : !stat.isFile())
      throw new Error(`Unexpected file type: ${current}`);
  }
  return current;
}

async function payloadFiles(root, relative = "") {
  const files = [];
  for (const entry of await readdir(path.join(root, relative), {
    withFileTypes: true,
  })) {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Refusing symlink: ${name}`);
    if (entry.isDirectory()) files.push(...(await payloadFiles(root, name)));
    else if (entry.isFile()) files.push(name);
    else throw new Error(`Unexpected payload file type: ${name}`);
  }
  return files.sort();
}

async function updateHashes(repoRoot, names) {
  const auditPath = await regularPath(
    repoRoot,
    "docs/ai/skill-source-audit.json",
    false,
  );
  const audit = JSON.parse(await readFile(auditPath, "utf8"));
  if (audit.schemaVersion !== 1 || !Array.isArray(audit.skills))
    throw new Error("Unsupported skill source audit schema");
  const updates = [];
  for (const name of names) {
    const entries = audit.skills.filter((entry) => entry.name === name);
    if (entries.length !== 1 || entries[0].ownership !== "canonical")
      throw new Error(`Expected one canonical audit record: ${name}`);
    const canonical = await regularPath(
      repoRoot,
      `docs/ai/skills/${name}`,
      true,
    );
    const root = await regularPath(repoRoot, `.agents/skills/${name}`, true);
    const files = await payloadFiles(root);
    const canonicalFiles = await payloadFiles(canonical);
    if (
      canonicalFiles.length !== files.length ||
      canonicalFiles.some((file, index) => file !== files[index])
    )
      throw new Error(`Canonical and installed skill payloads differ: ${name}`);
    if (!files.includes("SKILL.md"))
      throw new Error(`Missing entrypoint: ${name}`);
    const treeHash = createHash("sha256");
    let entrypointHash;
    for (const file of files) {
      const bytes = await readFile(path.join(root, file));
      const canonicalBytes = await readFile(path.join(canonical, file));
      if (!bytes.equals(canonicalBytes))
        throw new Error(
          `Canonical and installed skill payloads differ: ${name}/${file}`,
        );
      treeHash.update(file).update("\0").update(bytes).update("\0");
      if (file === "SKILL.md")
        entrypointHash = createHash("sha256").update(bytes).digest("hex");
    }
    updates.push({
      entry: entries[0],
      entrypointHash,
      treeHash: treeHash.digest("hex"),
    });
  }
  // Validate every selection and payload before mutating any record or writing.
  for (const { entry, entrypointHash, treeHash } of updates)
    Object.assign(entry, { entrypointHash, treeHash });
  const temporary = `${auditPath}.${randomUUID()}.tmp`;
  try {
    const configuration = await resolveConfig(
      path.join(defaultRoot, "package.json"),
    );
    const content = await format(JSON.stringify(audit), {
      ...configuration,
      parser: "json",
    });
    await writeFile(temporary, content, { flag: "wx" });
    await rename(temporary, auditPath);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`Updated installed payload hashes only: ${names.join(", ")}`);
}

async function main() {
  const args = process.argv.slice(2);
  let repoRoot = defaultRoot;
  const names = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: node scripts/update-skill-audit-hashes.mjs [--repo-root <path>] --skill <name> [--skill <name>]",
      );
      return;
    }
    if (arg === "--repo-root" && args[index + 1])
      repoRoot = path.resolve(args[++index]);
    else if (arg === "--skill" && safeName.test(args[index + 1] ?? ""))
      names.push(args[++index]);
    else throw new Error(`Invalid argument: ${arg}`);
  }
  if (names.length === 0)
    throw new Error("Select at least one reviewed skill with --skill");
  if (new Set(names).size !== names.length)
    throw new Error("Duplicate skill selection");
  await updateHashes(repoRoot, names);
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
