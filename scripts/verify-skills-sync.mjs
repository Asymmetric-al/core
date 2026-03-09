#!/usr/bin/env node

import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(process.execPath, ["scripts/sync-agent-skills.mjs"]);

const diffResult = spawnSync(
  "git",
  [
    "diff",
    "--exit-code",
    "--ignore-cr-at-eol",
    "--",
    ".agents/skills",
    ".cursor/skills",
  ],
  { stdio: "inherit" },
);

if (diffResult.error) {
  throw diffResult.error;
}

if (diffResult.status !== 0) {
  console.error(
    "Skill mirror drift detected. Run `bun run skills:sync` and commit mirror updates.",
  );
  process.exit(diffResult.status ?? 1);
}

const untrackedResult = spawnSync(
  "git",
  [
    "ls-files",
    "--others",
    "--exclude-standard",
    "--",
    ".agents/skills",
    ".cursor/skills",
  ],
  { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] },
);

if (untrackedResult.error) {
  throw untrackedResult.error;
}

if (untrackedResult.stdout.trim()) {
  console.error(untrackedResult.stdout.trim());
  console.error(
    "Skill mirror drift detected. Run `bun run skills:sync` and commit mirror updates.",
  );
  process.exit(1);
}
