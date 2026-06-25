import { spawnSync } from "node:child_process";

const args = ["vitest", "run", "--coverage"];

if (process.platform === "win32") {
  args.push("--maxWorkers=50%", "--testTimeout=30000", "--no-file-parallelism");
}

const result = spawnSync("bunx", args, {
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
