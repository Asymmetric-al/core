import { spawn } from "node:child_process";

import { repoRoot } from "./lib/paths.mjs";
import { runCommand } from "./lib/process.mjs";

runCommand(
  "bootstrap local CMS before dev servers",
  "bun",
  ["run", "cms:local:bootstrap"],
  {
    cwd: repoRoot,
  },
);

const children = [
  spawn("bun", ["run", "dev:admin"], {
    cwd: repoRoot,
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  }),
  spawn("bun", ["run", "dev:donor"], {
    cwd: repoRoot,
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  }),
];

function stopChildren(signal) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopChildren(signal);
    process.exit(0);
  });
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    stopChildren(signal ?? "SIGTERM");
    process.exit(code ?? 0);
  });
}
