#!/usr/bin/env node
// Generates the Core pack's role command files from the adapted role assets
// and writes the role provenance manifest. `--check` verifies without writing.
// Each command embeds its role asset byte-for-byte; a specialist command
// embeds only its own role (never the roster or coordinator material).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");
const pack = path.join(here, "pack");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const role = (name) =>
  readFileSync(path.join(pack, ".shared", "roles", `${name}.md`), "utf8");

const STAGES = {
  "deliver/commands/scope.md": [
    "samson",
    "Scope one authorized issue for delivery. You decide scope only; the factory runs the specialists.",
  ],
  "deliver/commands/assess.md": [
    "samson",
    "Assess two sealed, independent first-pass reviews of one frozen candidate and route every finding to its owner.",
  ],
  "deliver/commands/dispose.md": [
    "samson",
    "Disposition the live pull-request feedback for one candidate, item by item.",
  ],
  "deliver/commands/define.md": [
    "ezra",
    "Acceptance design or acceptance-oracle correction. Write tests only in the assigned test paths.",
  ],
  "deliver/commands/final.md": [
    "ezra",
    "Final, read-only acceptance of the committed candidate, criterion by criterion. Writers are paused.",
  ],
  "deliver/commands/build.md": [
    "bezalel",
    "Implement or repair the change within the assigned source paths.",
  ],
  "deliver/commands/review-micaiah.md": [
    "micaiah",
    "First-pass independent review of the frozen candidate.",
  ],
  "deliver/commands/review-luke.md": [
    "luke",
    "First-pass independent review of the frozen candidate.",
  ],
  "deliver/commands/adjudicate.md": [
    "agabus",
    "Adjudicate the supplied disputed claims from evidence.",
  ],
  "select/commands/rank.md": [
    "samson",
    "Rank the trusted ready frontier and choose the single next issue to admit.",
  ],
  "answer/commands/answer.md": [
    "samson",
    "Answer the operator's question about the factory, or translate a direction into one supported structured operation.",
  ],
};

export function renderCommand(roleName, stage) {
  return [
    "---",
    `description: ${stage.replace(/\n/g, " ")}`,
    "---",
    "",
    role(roleName).trimEnd(),
    "",
    "---",
    "",
    `Stage: ${stage}`,
    "",
    "$INPUTS.assignment",
    "",
  ].join("\n");
}

const SOURCES = [
  ".codex/agents/samson.toml",
  ".codex/agents/ezra.toml",
  ".codex/agents/bezalel.toml",
  ".codex/agents/micaiah.toml",
  ".codex/agents/luke.toml",
  ".codex/agents/agabus.toml",
  "docs/ai/skills/samson-factory/SKILL.md",
  "docs/ai/skills/samson-factory/references/protocol.md",
];

export function manifest() {
  const normalized = (file) =>
    readFileSync(path.join(repo, file), "utf8").replace(/\r\n/g, "\n");
  return {
    version: 1,
    note: "Adapted Claude/Archon roles for the VM 100 factory lane. Hashes are over LF-normalized bytes.",
    sources: Object.fromEntries(
      SOURCES.map((file) => [file, sha(normalized(file))]),
    ),
    roles: Object.fromEntries(
      ["samson", "ezra", "bezalel", "micaiah", "luke", "agabus"].map((name) => [
        name,
        sha(role(name)),
      ]),
    ),
    commands: Object.fromEntries(
      Object.entries(STAGES).map(([file, [roleName, stage]]) => [
        file,
        { role: roleName, sha256: sha(renderCommand(roleName, stage)) },
      ]),
    ),
  };
}

function main() {
  const check = process.argv.includes("--check");
  const problems = [];
  for (const [file, [roleName, stage]] of Object.entries(STAGES)) {
    const target = path.join(pack, file);
    const expected = renderCommand(roleName, stage);
    let actual = null;
    try {
      actual = readFileSync(target, "utf8");
    } catch {}
    if (actual !== expected) {
      if (check) problems.push(`${file} is stale`);
      else writeFileSync(target, expected);
    }
  }
  const manifestFile = path.join(pack, ".shared", "roles", "manifest.json");
  const expectedManifest = JSON.stringify(manifest(), null, 2) + "\n";
  let actualManifest = null;
  try {
    actualManifest = readFileSync(manifestFile, "utf8");
  } catch {}
  if (actualManifest !== expectedManifest) {
    if (check) problems.push("roles/manifest.json is stale");
    else writeFileSync(manifestFile, expectedManifest);
  }
  if (problems.length) {
    console.error(problems.join("\n"));
    console.error("Run: node scripts/archon-factory/build-pack.mjs");
    process.exit(1);
  }
  console.log(
    check
      ? "Pack commands and role manifest are current."
      : "Pack commands and role manifest written.",
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  main();
