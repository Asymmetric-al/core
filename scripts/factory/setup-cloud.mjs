import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const manifest = JSON.parse(
  readFileSync(path.join(root, "package.json"), "utf8"),
);
const expected = manifest.packageManager.replace(/^bun@/, "");
const installed = spawnSync("bun", ["--version"], {
  cwd: root,
  encoding: "utf8",
  shell: false,
});
if (installed.status !== 0 || installed.stdout.trim() !== expected) {
  console.error(
    `Cloud setup requires Bun ${expected} from package.json; install that runtime before running this script.`,
  );
  process.exit(1);
}
for (const role of ["samson", "ezra", "bezalel", "micaiah", "luke", "agabus"]) {
  if (!existsSync(path.join(root, ".codex", "agents", `${role}.toml`))) {
    throw new Error(`Missing factory role: ${role}`);
  }
}
const commands = process.argv.includes("--verify-only")
  ? [
      ["bun", ["run", "verify:bun-version"]],
      ["bun", ["run", "skills:verify"]],
      ["bun", ["run", "verify:workspace-contract"]],
    ]
  : [
      ["bun", ["ci", "--backend=copyfile"]],
      ["bun", ["run", "verify:bun-version"]],
      ["bun", ["run", "skills:verify"]],
      ["bun", ["run", "verify:workspace-contract"]],
    ];
for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(
  "Core dependencies and six role files are prepared. Actual role loading, model access and isolation still require runtime verification.",
);
