import { spawnSync } from "node:child_process";

const baseArgs = ["-y", "react-doctor@latest"];
const extraArgs = process.argv.slice(2);
const targets = ["apps", "packages"];

for (const target of targets) {
  const result = spawnSync(
    "npx",
    [...baseArgs, target, "--verbose", ...extraArgs],
    {
      cwd: process.cwd(),
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}
