import { spawnSync } from "node:child_process";

import { adminAppDir, repoRoot } from "./lib/paths.mjs";
import { runCommand } from "./lib/process.mjs";

runCommand(
  "generate Payload import map",
  "node",
  ["scripts/cms/run-payload-command.mjs", "generate:importmap"],
  {
    cwd: repoRoot,
  },
);

const postProcess = spawnSync(
  "node",
  ["../../scripts/dev/postprocess-payload-importmap.mjs"],
  {
    cwd: adminAppDir,
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

if (postProcess.error) {
  throw new Error(
    `Failed to post-process Payload import map: ${postProcess.error.message}`,
    { cause: postProcess.error },
  );
}

process.exit(postProcess.status ?? 1);
