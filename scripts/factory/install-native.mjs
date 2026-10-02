#!/usr/bin/env node
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const configMarkers = [
  "# BEGIN Samson native role configuration",
  "# END Samson native role configuration",
];
const policyMarkers = [
  "<!-- BEGIN Samson coordination policy -->",
  "<!-- END Samson coordination policy -->",
];

function readOptional(file) {
  try {
    return readFileSync(file);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function ownedBlock(text, markers, label, required = false) {
  const starts = [
    ...text.matchAll(new RegExp(`^${escapeRegex(markers[0])}\\r?$`, "gm")),
  ];
  const ends = [
    ...text.matchAll(new RegExp(`^${escapeRegex(markers[1])}\\r?$`, "gm")),
  ];
  // Also reject marker text that is present but not on a complete marker line.
  const occurrences = markers.map((marker) => text.split(marker).length - 1);
  if (
    starts.length === 0 &&
    ends.length === 0 &&
    occurrences.every((count) => count === 0) &&
    !required
  )
    return null;
  if (
    starts.length !== 1 ||
    ends.length !== 1 ||
    occurrences.some((count) => count !== 1) ||
    starts[0].index >= ends[0].index
  ) {
    throw new Error(`Malformed owned markers in ${label}`);
  }
  const start = starts[0].index;
  const end = ends[0].index + ends[0][0].length;
  return { start, end, text: text.slice(start, end) };
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function mergeBlock(existing, block, markers, label) {
  const owned = ownedBlock(existing, markers, label);
  const outside = owned
    ? existing.slice(0, owned.start) + existing.slice(owned.end)
    : existing;
  if (
    markers === configMarkers &&
    /^\s*(?:\[\[?\s*["']?agents(?:["']?\s*[.\]])|["']?agents["']?\s*[.=])/m.test(
      outside,
    )
  ) {
    throw new Error(
      `Unmanaged agents configuration in ${label}. Reconcile the existing agents configuration with the owned block before installation. Files were left unchanged.`,
    );
  }
  if (owned)
    return existing.slice(0, owned.start) + block + existing.slice(owned.end);
  return (
    existing + (existing && !existing.endsWith("\n") ? "\n" : "") + block + "\n"
  );
}
function treeFiles(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory())
      return treeFiles(path.join(directory, entry.name), relative);
    if (!entry.isFile())
      throw new Error(
        `Source asset must be a regular file: ${path.join(directory, entry.name)}`,
      );
    return [relative];
  });
}

/** Install owned native configuration, global policy and personal skill; verify is read-only. */
export function installNative({
  sourceRoot = repositoryRoot,
  home = os.homedir(),
  codexHome = process.env.CODEX_HOME,
  verify = false,
} = {}) {
  const configSource = path.join(sourceRoot, ".codex/config.toml");
  const config = ownedBlock(
    readFileSync(configSource, "utf8"),
    configMarkers,
    configSource,
    true,
  ).text;
  const policySource = path.join(sourceRoot, ".codex/factory-AGENTS.md");
  const policy = ownedBlock(
    readFileSync(policySource, "utf8"),
    policyMarkers,
    policySource,
    true,
  ).text;
  const agentsSource = path.join(sourceRoot, ".codex/agents");
  const roleFiles = treeFiles(agentsSource).filter((file) =>
    file.endsWith(".toml"),
  );
  if (!roleFiles.length) throw new Error("Missing native role assets");
  const roles = roleFiles.map((file) => [
    file,
    readFileSync(path.join(agentsSource, file)),
  ]);
  const references = [
    ...config.matchAll(
      /^\s*config_file\s*=\s*("(?:[^"\\]|\\.)*")\s*(?:#.*)?$/gm,
    ),
  ];
  if (!references.length)
    throw new Error("Missing native config_file references");
  for (const reference of references) {
    const relative = JSON.parse(reference[1]);
    if (
      !relative.startsWith("agents/") ||
      !roleFiles.includes(relative.slice(7))
    )
      throw new Error(`Missing or invalid role asset: ${relative}`);
  }
  const skillSource = path.join(sourceRoot, "docs/ai/skills/samson-factory");
  const skillFiles = treeFiles(skillSource);
  for (const required of ["SKILL.md", path.join("references", "protocol.md")]) {
    if (!skillFiles.includes(required))
      throw new Error(`Missing skill asset: ${required}`);
  }
  const skill = skillFiles.map((file) => [
    file,
    readFileSync(path.join(skillSource, file)),
  ]);
  const destinations = [
    ...new Set([
      path.resolve(home, ".codex"),
      ...(codexHome ? [path.resolve(codexHome)] : []),
    ]),
  ];
  const plan = [];
  for (const destination of destinations) {
    const resolvedConfig = config.replace(
      /^(\s*config_file\s*=\s*)("(?:[^"\\]|\\.)*")/gm,
      (_, prefix, relative) =>
        prefix + JSON.stringify(path.join(destination, JSON.parse(relative))),
    );
    for (const [name, block, markers] of [
      ["config.toml", resolvedConfig, configMarkers],
      ["AGENTS.md", policy, policyMarkers],
    ]) {
      const file = path.join(destination, name);
      const existing = readOptional(file);
      plan.push([
        file,
        Buffer.from(
          mergeBlock(existing?.toString("utf8") ?? "", block, markers, file),
        ),
        existing,
      ]);
    }
    for (const [relative, bytes] of roles) {
      const file = path.join(destination, "agents", relative);
      plan.push([file, bytes, readOptional(file)]);
    }
  }
  for (const [relative, bytes] of skill) {
    const file = path.join(home, ".agents/skills/samson-factory", relative);
    plan.push([file, bytes, readOptional(file)]);
  }
  // Complete all source and destination validation before the first write.
  const changed = plan.filter(
    ([, bytes, existing]) => !existing?.equals(bytes),
  );
  if (verify && changed.length)
    throw new Error(
      `Native installation drift: ${changed.map(([file]) => file).join(", ")}`,
    );
  if (!verify)
    for (const [file, bytes] of changed) {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, bytes);
    }
  return { destinations, changedFiles: changed.map(([file]) => file) };
}

export function runNativeCli({ args = [], ...options } = {}) {
  if (args.length > 1 || args.some((arg) => arg !== "--verify-only")) {
    throw new Error(
      "Unsupported installer flags; use --verify-only or no flags.",
    );
  }
  return installNative({ ...options, verify: args[0] === "--verify-only" });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    runNativeCli({ args: process.argv.slice(2) });
    console.log("Native factory instructions verified.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
